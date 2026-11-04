import type {
  ComarkParseFn,
  ComarkParsePostState,
  ComarkPlugin,
  MarkdownExitPlugin,
  MergePluginFrontmatter,
  MergePluginMeta,
  ResolvedFrontmatter,
  ResolvedMeta,
  MarkdownDocument,
  Node,
  ParserCoreOptions,
} from './types.ts'
import MarkdownExit, { type Token } from 'markdown-exit'
import { applyAutoUnwrap, extractReusableNodes } from './internal/parse/utils.ts'
import { applyUnwrap, resolveUnwrapTags } from './internal/parse/unwrap.ts'
import { createSerializedTask } from './utils/helpers.ts'
import { noopTracer, withSpan } from './utils/trace.ts'
import { tokenListToTree } from './internal/parse/tree.ts'

// Re-export plugin utilities
export { defineComarkPlugin } from './utils/helpers.ts'

// Re-export types
export type * from './types.ts'

// Constructing a `MarkdownExit` instance is expensive because `LinkifyIt`
// compiles its regexes in the constructor, and a configured instance holds no
// per-parse state, so parsers built from the same options share one.
// Bounded LRU: a caller that keeps minting fresh markdown-it plugin closures
// (math/mermaid/binding factories) must not grow this without limit.
const MAX_SHARED_PARSERS = 32
let nextPluginId = 0
const pluginIds = new WeakMap<MarkdownExitPlugin, number>()
const sharedParsers = new Map<string, MarkdownExit>()

/**
 * Creates a parser function for Comark content.
 *
 * Returns an async function that takes a markdown string and returns a Promise resolving to a MarkdownDocument AST.
 * The returned parser applies the plugins in `options.plugins` (it does not register defaults),
 * token-to-AST conversion, an optional auto-close function, AST transformations and plugin hooks.
 * Prefer `createMarkdownParser` from `comark` when you want the built-in plugins
 * and boolean `autoClose`.
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
 * // Plugins are opt-in. Pass resolved plugins; this entry does not register defaults.
 * const tree2 = await parseMarkdown('<strong class="bold">Hello</strong> _world_')
 * console.log(tree2.nodes)
 * // → [ ['p', {}, '<strong class="bold">Hello</strong> ', ['em', {}, 'world']] ]
 * ```
 */
export function createMarkdownParser<const TPlugins extends readonly ComarkPlugin<any, any>[] = []>(
  options: ParserCoreOptions<TPlugins> = {} as ParserCoreOptions<TPlugins>
): ComarkParseFn<ResolvedMeta<MergePluginMeta<TPlugins>>, ResolvedFrontmatter<MergePluginFrontmatter<TPlugins>>> {
  const { autoUnwrap = true, autoClose, tracer = noopTracer } = options
  // Tag set to strip from the top level of the tree (MDC `unwrap`). Resolved once.
  const unwrapTags = resolveUnwrapTags(options.unwrap)
  const plugins = options.plugins ?? []

  const mdPlugins: MarkdownExitPlugin[] = []
  for (const plugin of plugins) {
    for (const markdownItPlugin of plugin.markdownItPlugins || []) {
      mdPlugins.push(markdownItPlugin as unknown as MarkdownExitPlugin)
    }
  }

  const linkify = options.linkify ?? true
  const key = [
    linkify,
    ...mdPlugins.map((fn) => pluginIds.get(fn) ?? (pluginIds.set(fn, nextPluginId), nextPluginId++)),
  ].join(',')

  let parser = sharedParsers.get(key)
  if (parser) {
    // Touch for LRU: Map iteration order is insertion order.
    sharedParsers.delete(key)
    sharedParsers.set(key, parser)
  } else {
    parser = new MarkdownExit({ linkify }).enable(['table', 'strikethrough'])
    for (const fn of mdPlugins) parser.use(fn)
    if (sharedParsers.size >= MAX_SHARED_PARSERS) {
      const oldestKey = sharedParsers.keys().next().value
      if (oldestKey !== undefined) sharedParsers.delete(oldestKey)
    }
    sharedParsers.set(key, parser)
  }

  let lastOutput: MarkdownDocument | null = null
  let lastInput: string | null = null

  const parseFn: ComarkParseFn = async (markdown, opts = {}) => {
    // Root active span for the full parse pipeline. Nested startActiveSpan /
    // startSpan calls become children (OTel active context, or a stack in a
    // simple recorder) → hierarchical trace:
    //   comark:parse → autoclose / pre / tokenize / nodes / post
    return await withSpan(tracer, 'comark:parse', async () => {
      const state = {
        options,
        tokens: [] as Token[],
        markdown,
        tree: null as MarkdownDocument | null,
        parsedLines: 0,
        reusableNodes: [] as Node[],
        frontmatterText: '',
        frontmatter: {} as Record<string, any>,
      }

      const prevOutput = lastOutput
      const isStartsWithLastInput = markdown.startsWith(lastInput ?? '')
      // TODO(streaming): `]:` and the heading-tail check force a full reparse so
      // reference definitions / heading IDs stay correct. Find a way to keep
      // incremental reuse here (carry env.references + id counters into the tail
      // parse, or patch completed nodes) without scanning/reparsing the prefix.
      if (opts.streaming && prevOutput && isStartsWithLastInput && !markdown.includes(']:')) {
        const { remainingMarkdownStartLine, reusedNodes, remainingMarkdown } = extractReusableNodes(
          markdown,
          prevOutput
        )

        // If there is no remaining markdown, return the previous output
        if (!remainingMarkdown) return prevOutput

        // Heading IDs and reference links depend on the full document.
        if (!/#|(?:^|\n)[^\n]*[=-][ \t]*\r?(?:\n|$)/.test(remainingMarkdown)) {
          state.parsedLines = remainingMarkdownStartLine
          state.markdown = remainingMarkdown
          state.reusableNodes = reusedNodes
        }
      }

      if (typeof autoClose === 'function') {
        state.markdown = withSpan(tracer, 'comark:autoclose', () => autoClose(state.markdown, opts.streaming))
      }

      for (const plugin of plugins) {
        if (!plugin.pre) continue
        await withSpan(tracer, `comark:pre:${plugin.name}`, () => plugin.pre!(state))
      }

      try {
        state.tokens = withSpan(tracer, 'comark:tokenize', () => parser.parse(state.markdown, {}))
      } catch (e) {
        // in case of streaming, return the previous output if parsing fails
        // This is to avoid resetting the tree to an empty state on failure
        // resetting the tree will re-redner whole tree
        if (opts.streaming && prevOutput) {
          return prevOutput
        }
        throw e
      }

      for (const plugin of plugins) {
        if (!plugin.markdownItPost) continue
        withSpan(tracer, `comark:markdownItPost:${plugin.name}`, () =>
          plugin.markdownItPost!(state as ComarkParsePostState)
        )
      }

      const nodesSpan = tracer.startSpan('comark:nodes')
      let nodes = tokenListToTree(state.tokens, {
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
          frontmatter:
            frontmatterText || !isStartsWithLastInput ? frontmatterData : (prevOutput?.frontmatter ?? frontmatterData),
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
        await withSpan(tracer, `comark:post:${plugin.name}`, () => plugin.post!(state as ComarkParsePostState))
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
  options: ParserCoreOptions<TPlugins> = {} as ParserCoreOptions<TPlugins>
): Promise<
  MarkdownDocument<ResolvedMeta<MergePluginMeta<TPlugins>>, ResolvedFrontmatter<MergePluginFrontmatter<TPlugins>>>
> {
  const parser = createMarkdownParser(options)

  return await parser(markdown)
}

/**
 * Creates a serialized parser that reuses stream state across calls.
 * Overlapping parses run one at a time; each caller still receives its own
 * result or rejection (plugin errors are not swallowed).
 *
 * @param options - Parser options
 * @returns ComarkParseFn - The serialized parser function
 *
 * @example
 * ```typescript
 * import { createSerializedMarkdownParser } from 'comark'
 *
 * const parseMarkdown = createSerializedMarkdownParser()
 * const tree = await parseMarkdown(content, { streaming: true })
 * console.log(tree.nodes)
 */
export function createSerializedMarkdownParser<const TPlugins extends readonly ComarkPlugin<any, any>[] = []>(
  options: ParserCoreOptions<TPlugins> = {} as ParserCoreOptions<TPlugins>
): ComarkParseFn<ResolvedMeta<MergePluginMeta<TPlugins>>, ResolvedFrontmatter<MergePluginFrontmatter<TPlugins>>> {
  return createSerializedTask(createMarkdownParser(options))
}
