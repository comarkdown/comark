import type {
  ComarkParseFn,
  ComarkParsePostState,
  ComarkPlugin,
  MarkdownExitPlugin,
  MergePluginFrontmatter,
  MergePluginMeta,
  ComarkPerf,
  ComarkSpan,
  ComarkSpanOptions,
  ParserOptions,
  ResolvedFrontmatter,
  ResolvedMeta,
  MarkdownDocument,
  Node,
} from './types.ts'
import MarkdownExit from 'markdown-exit'
import components from './plugins/components.ts'
import attributes from './plugins/attributes.ts'
import taskList from './plugins/task-list.ts'
import alert from './plugins/alert.ts'
import html from './plugins/html.ts'
import frontmatterPlugin from './plugins/frontmatter.ts'
import { applyAutoUnwrap } from './internal/parse/auto-unwrap.ts'
import { applyUnwrap, resolveUnwrapTags } from './internal/parse/unwrap.ts'
import { marmdownItTokensToMarkdownDocument } from './internal/parse/token-processor.ts'
import { autoCloseMarkdown } from './internal/parse/auto-close/index.ts'
import { extractReusableNodes } from './internal/parse/incremental.ts'
import { createSerializedTask, dedupePlugins } from './utils/helpers.ts'

// Re-export frontmatter utilities
export { parseFrontmatter } from './internal/frontmatter.ts'

// Re-export plugin utilities
export { defineComarkPlugin } from './utils/helpers.ts'

/** No-op span used by {@link noopPerf}. */
const noopSpan: ComarkSpan = { end: () => {} }

/** No-op recorder used when no `perf` option is provided — zero overhead. */
const noopPerf: ComarkPerf = {
  startSpan: () => noopSpan,
  startActiveSpan: (
    name: string,
    optionsOrFn: ComarkSpanOptions | ((span: ComarkSpan) => unknown),
    fn?: (span: ComarkSpan) => unknown
  ) => {
    const run = typeof optionsOrFn === 'function' ? optionsOrFn : fn!
    return run(noopSpan)
  },
}

/**
 * Creates a parser function for Comark content.
 *
 * Returns an async function that takes a markdown string and returns a Promise resolving to a MarkdownDocument AST.
 * The returned parser applies frontmatter extraction, Comark syntax parsing, token-to-AST conversion,
 * auto-closing of incomplete markdown, optional AST transformations and plugin hooks.
 *
 * @param options - Parser options controlling parsing behavior.
 * @returns An async parser function: (markdown) => Promise<MarkdownDocument>
 *
 * @example
 * ```typescript
 * import { createMarkdownParser } from 'comark'
 *
 * const parseMarkdown = createMarkdownParser({ autoUnwrap: false })
 * const tree = await parseMarkdown('# Hello **World**\n::alert\nhi\n::')
 * console.log(tree.nodes)
 * // → [ ['h1', { id: 'hello-world' }, 'Hello ', ['strong', {}, 'World'] ], ['alert', {}, 'hi'] ]
 *
 * // HTML parsing is on by default via the built-in `html` plugin
 * const tree2 = await parseMarkdown('<strong class="bold">Hello</strong> _world_')
 * console.log(tree2.nodes)
 * // → [ ['strong', { class: 'bold' }, 'Hello'], ' ', ['em', {}, 'world'] ]
 *
 * // Disable default plugins (including HTML) — HTML tags are plain text
 * const parsePlain = createMarkdownParser({ registerDefaultPlugins: false })
 * ```
 */
export function createMarkdownParser<const TPlugins extends readonly ComarkPlugin<any, any>[] = []>(
  options: ParserOptions<TPlugins> = {} as ParserOptions<TPlugins>
): ComarkParseFn<ResolvedMeta<MergePluginMeta<TPlugins>>, ResolvedFrontmatter<MergePluginFrontmatter<TPlugins>>> {
  const { autoUnwrap = true, autoClose = true, perf = noopPerf } = options
  // Tag set to strip from the top level of the tree (MDC `unwrap`). Resolved once.
  const unwrapTags = resolveUnwrapTags(options.unwrap)

  const userPlugins = options.plugins ?? []

  // `options.html` is deprecated — prefer `registerDefaultPlugins: false` (or
  // omitting the html plugin from an explicit plugins list).
  if (options.html !== undefined) {
    console.warn(
      '[comark] `ParserOptions.html` is deprecated and will be removed in a future major version. ' +
        'Use `registerDefaultPlugins: false` and register `html()` from `comark/plugins/html` only when needed.'
    )
  }

  // User plugins first so same-name entries override defaults via dedupePlugins.
  const defaultPlugins =
    options.registerDefaultPlugins !== false
      ? [
          frontmatterPlugin(),
          // Honor deprecated `html: false` so callers can keep disabling HTML for now.
          ...(options.html !== false ? [html()] : []),
          alert(),
          taskList(),
          components(),
          attributes(),
        ]
      : []

  const plugins = dedupePlugins([...userPlugins, ...defaultPlugins])
  const hasPlugin = (name: string) => plugins.some((plugin) => plugin.name === name)

  const parser = new MarkdownExit({ linkify: options.linkify ?? true }).enable(['table', 'strikethrough'])

  for (const plugin of plugins) {
    for (const markdownItPlugin of plugin.markdownItPlugins || []) {
      parser.use(markdownItPlugin as unknown as MarkdownExitPlugin)
    }
  }

  let lastOutput: MarkdownDocument | null = null
  let lastInput: string | null = null

  /** Run `fn` inside an active span; always ends the span (incl. async). */
  function withSpan<T>(name: string, fn: () => T): T {
    return perf.startActiveSpan(name, (span) => {
      try {
        const result = fn()
        if (result instanceof Promise) {
          return result.finally(() => span.end()) as T
        }
        span.end()
        return result
      } catch (error) {
        span.end()
        throw error
      }
    })
  }

  const parseFn: ComarkParseFn = async (markdown, opts = {}) => {
    // Root active span for the full parse pipeline. Nested startActiveSpan /
    // startSpan calls become children (OTel active context, or a stack in a
    // simple recorder) → hierarchical trace:
    //   comark:parse → autoclose / pre / tokenize / nodes / post
    return await withSpan('comark:parse', async () => {
      const state = {
        options,
        tokens: [] as unknown[],
        markdown,
        tree: null as MarkdownDocument | null,
        parsedLines: 0,
        reusableNodes: [] as Node[],
        frontmatterText: '',
        frontmatter: {} as Record<string, any>,
      }

      const prevOutput = lastOutput
      const isStartsWithLastInput = markdown.startsWith(lastInput ?? '')
      if (opts.streaming && prevOutput && isStartsWithLastInput) {
        const { remainingMarkdownStartLine, reusedNodes, remainingMarkdown } = extractReusableNodes(
          markdown,
          prevOutput
        )

        // If there is no remaining markdown, return the previous output
        if (!remainingMarkdown) return prevOutput

        state.parsedLines = remainingMarkdownStartLine
        state.markdown = remainingMarkdown
        state.reusableNodes = reusedNodes
      }

      if (autoClose) {
        state.markdown = withSpan('comark:autoclose', () =>
          autoCloseMarkdown(state.markdown, {
            frontmatter: hasPlugin('frontmatter') && opts.streaming,
            syntax: hasPlugin('components'),
          })
        )
      }

      for (const plugin of plugins) {
        if (!plugin.pre) continue
        await withSpan(`comark:pre:${plugin.name}`, () => plugin.pre!(state))
      }

      try {
        state.tokens = withSpan('comark:tokenize', () => parser.parse(state.markdown, {}))
      } catch (e) {
        // in case of streaming, return the previous output if parsing fails
        // This is to avoid resetting the tree to an empty state on failure
        // resetting the tree will re-redner whole tree
        if (opts.streaming && prevOutput) {
          return prevOutput
        }
        throw e
      }

      // Convert tokens to Comark structure
      const nodesSpan = perf.startSpan('comark:nodes')
      let nodes = marmdownItTokensToMarkdownDocument(state.tokens, {
        startLine: state.parsedLines,
        preservePositions: opts.streaming ?? false,
        headingIds: options.headingIds ?? true,
      })

      if (autoUnwrap) {
        nodes = nodes.map((node: Node) => applyAutoUnwrap(node))
      }

      if (unwrapTags.length > 0) {
        nodes = applyUnwrap(nodes, unwrapTags)
      }
      nodesSpan.end()

      const frontmatterData = (state.frontmatter ?? {}) as Record<string, any>
      const frontmatterText = (state.frontmatterText ?? '') as string

      if (opts.streaming) {
        state.tree = {
          frontmatter: frontmatterText ? frontmatterData : (prevOutput?.frontmatter ?? frontmatterData),
          meta: {},
          nodes: [...state.reusableNodes, ...nodes],
        }
        // Set last output and input for streaming mode
        lastOutput = state.tree
        lastInput = markdown
      } else {
        state.tree = {
          frontmatter: frontmatterData,
          meta: {},
          nodes,
        }
        // Reset last output and input for non-streaming mode
        lastOutput = null
        lastInput = null
      }

      for (const plugin of plugins) {
        if (!plugin.post) continue
        await withSpan(`comark:post:${plugin.name}`, () => plugin.post!(state as ComarkParsePostState))
      }

      return state.tree
    })
  }

  return parseFn as ComarkParseFn<
    ResolvedMeta<MergePluginMeta<TPlugins>>,
    ResolvedFrontmatter<MergePluginFrontmatter<TPlugins>>
  >
}

/**
 * Parse Comark content from a string
 *
 * @param markdown - The markdown/Comark content as a string
 * @param options - Parser options
 * @returns MarkdownDocument - The parsed AST tree
 *
 * @example
 * ```typescript
 * import { parseMarkdown } from 'comark'
 *
 * const content = `---
 * title: Hello World
 * ---
 *
 * # Hello World
 *
 * This is a **markdown** document with *Comark* components.
 *
 * ::alert{type="info"}
 * This is an alert component
 * ::
 * `
 *
 * const tree = await parseMarkdown(content)
 * console.log(tree.nodes)        // Array of AST nodes
 * console.log(tree.frontmatter)  // { title: 'Hello World' }
 * console.log(tree.meta)         // Additional metadata
 *
 * // Disable auto-unwrap
 * const tree2 = await parseMarkdown(content, { autoUnwrap: false })
 * ```
 */
export async function parseMarkdown<const TPlugins extends readonly ComarkPlugin<any, any>[] = []>(
  markdown: string,
  options: ParserOptions<TPlugins> = {} as ParserOptions<TPlugins>
): Promise<
  MarkdownDocument<ResolvedMeta<MergePluginMeta<TPlugins>>, ResolvedFrontmatter<MergePluginFrontmatter<TPlugins>>>
> {
  const parser = createMarkdownParser(options)

  return await parser(markdown)
}

/**
 * Creates a serialized parser function for Comark content.
 * This is useful for parsing large files in a streaming manner.
 *
 * @param options - Parser options
 * @returns ComarkParseFn - The serialized parser function
 *
 * @example
 * ```typescript
 * import { createSerializedMarkdownParser } from 'comark'
 *
 * const parseMarkdown = createSerializedMarkdownParser()
 * const tree = await parseMarkdown(content)
 * console.log(tree.nodes)
 */
export function createSerializedMarkdownParser<const TPlugins extends readonly ComarkPlugin<any, any>[] = []>(
  options: ParserOptions<TPlugins> = {} as ParserOptions<TPlugins>
): ComarkParseFn<ResolvedMeta<MergePluginMeta<TPlugins>>, ResolvedFrontmatter<MergePluginFrontmatter<TPlugins>>> {
  return createSerializedTask(createMarkdownParser(options))
}
