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
import MarkdownExit, { type Token } from 'markdown-exit/core'
import type LinkifyIt from 'linkify-it'
import { applyAutoUnwrap, extractReusableNodes } from './internal/parse/utils.ts'
import { applyUnwrap, resolveUnwrapTags } from './internal/parse/unwrap.ts'
import { createSerializedTask } from './utils/helpers.ts'
import { noopTracer, withSpan } from './utils/trace.ts'
import { tokenListToTree } from './internal/parse/tree.ts'

// Re-export plugin utilities
export { defineComarkPlugin } from './utils/helpers.ts'

// Re-export types
export type * from './types.ts'

// A configured `MarkdownExit` instance holds no per-parse state, so parsers
// built from the same options share one.
// Bounded LRU: a caller that keeps minting fresh markdown-it plugin closures
// (math/mermaid/binding factories) must not grow this without limit.
const MAX_SHARED_PARSERS = 32
let nextPluginId = 0
const pluginIds = new WeakMap<MarkdownExitPlugin, number>()
const sharedParsers = new Map<string, SharedParser>()

interface SharedParser {
  md: MarkdownExit
  // With `linkify`, settles once linkify-it is loaded and the markdown-it plugins are installed.
  ready?: Promise<void>
  // Without `linkify`, set when a markdown-it plugin needs `md.linkify` to install.
  needsLinkify?: boolean
}

// Loaded on the first parse that needs it, so bundles without it skip linkify-it.
let linkifyModule: Promise<typeof LinkifyIt> | undefined

// markdown-it plugins may configure `md.linkify` when installed, so they run after it exists.
// This also replaces the instance that the root `markdown-exit` entry gives every parser once
// something imports it. linkify-it 5 links `www.example.com` and `user:pass@` URLs by default;
// linkify-it 6 needs `fuzzyLink` for that, which made streaming chat text about 1.8x slower
// (markdown-it/linkify-it#126).
async function installLinkify(shared: SharedParser, mdPlugins: MarkdownExitPlugin[], linkify: boolean): Promise<void> {
  try {
    const Linkify = await (linkifyModule ??= import('linkify-it').then((m) => m.default))
    // markdown-exit types this as linkify-it 6. It only calls `test`, `match` and `matchAtStart`, which 5 has too.
    shared.md.linkify = new Linkify() as unknown as MarkdownExit['linkify']
    for (const fn of mdPlugins) shared.md.use(fn)
  } catch (error) {
    // Start over on the next parse: retry a failed load, such as a chunk fetch, and drop
    // an instance that a throwing plugin left half set up.
    linkifyModule = undefined
    shared.md = createMarkdownExit(linkify)
    shared.ready = undefined
    throw error
  }
}

function createMarkdownExit(linkify: boolean): MarkdownExit {
  return new MarkdownExit({ linkify }).enable(['table', 'strikethrough'])
}

/**
 * Creates a parser function without default plugins or a built-in auto-closer.
 *
 * Runs only the plugins in `options.plugins` and, when `options.autoClose` is a
 * function, calls it before tokenizing. Use `createMarkdownParser` from `comark`
 * for the built-in plugins and boolean `autoClose`.
 *
 * @example
 * ```typescript
 * import { createMarkdownParser } from 'comark/core'
 * import components from 'comark/plugins/components'
 *
 * const parse = createMarkdownParser({ plugins: [components()] })
 * const tree = await parse('::alert\nhi\n::')
 * // → [ ['alert', {}, 'hi'] ]
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

  let shared = sharedParsers.get(key)
  if (shared) {
    // Touch for LRU: Map iteration order is insertion order.
    sharedParsers.delete(key)
    sharedParsers.set(key, shared)
  } else {
    shared = { md: createMarkdownExit(linkify) }
    if (!linkify) {
      try {
        for (const fn of mdPlugins) shared.md.use(fn)
      } catch (error) {
        // `markdown-exit/core` has no `md.linkify`. Plugins that configure it get one on the first parse.
        if (shared.md.linkify) throw error
        shared = { md: createMarkdownExit(false), needsLinkify: true }
      }
    }
    if (sharedParsers.size >= MAX_SHARED_PARSERS) {
      const oldestKey = sharedParsers.keys().next().value
      if (oldestKey !== undefined) sharedParsers.delete(oldestKey)
    }
    sharedParsers.set(key, shared)
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

      // Same key, same plugin functions, so any parser sharing this instance can install them.
      if (linkify || shared.needsLinkify) await (shared.ready ??= installLinkify(shared, mdPlugins, linkify))

      try {
        state.tokens = withSpan(tracer, 'comark:tokenize', () => shared.md.parse(state.markdown, {}))
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
 * Parse a string with the core pipeline: no default plugins, no built-in auto-closer.
 * See {@link createMarkdownParser}.
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
 * Core-pipeline variant of `createSerializedMarkdownParser` from `comark`:
 * overlapping parses run one at a time so streaming state stays ordered.
 */
export function createSerializedMarkdownParser<const TPlugins extends readonly ComarkPlugin<any, any>[] = []>(
  options: ParserCoreOptions<TPlugins> = {} as ParserCoreOptions<TPlugins>
): ComarkParseFn<ResolvedMeta<MergePluginMeta<TPlugins>>, ResolvedFrontmatter<MergePluginFrontmatter<TPlugins>>> {
  return createSerializedTask(createMarkdownParser(options))
}
