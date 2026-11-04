import type {
  ComarkParseFn,
  ComarkPlugin,
  MergePluginFrontmatter,
  MergePluginMeta,
  ParserCoreOptions,
  ParserOptions,
  ResolvedFrontmatter,
  ResolvedMeta,
  MarkdownDocument,
} from './types.ts'
import components from './plugins/components.ts'
import attributes from './plugins/attributes.ts'
import taskList from './plugins/task-list.ts'
import alert from './plugins/alert.ts'
import html from './plugins/html.ts'
import frontmatterPlugin from './plugins/frontmatter.ts'
import { autoCloseMarkdown } from './auto-close.ts'
import { createSerializedTask, dedupePlugins } from './utils/helpers.ts'
import { noopTracer } from './utils/trace.ts'
import { createMarkdownParser as createCoreMarkdownParser } from './core.ts'

// Re-export auto-close utilities
export { autoCloseMarkdown, INCOMPLETE_LINK_PLACEHOLDER, INCOMPLETE_IMAGE_PLACEHOLDER } from './auto-close.ts'
export type { AutoCloseOptions, LinkMode } from './auto-close.ts'

// Re-export frontmatter utilities
export { parseFrontmatter } from './internal/frontmatter.ts'

// Re-export plugin utilities
export { defineComarkPlugin } from './utils/helpers.ts'

// Re-export the ambient renderer context for live updates
export { createComarkContext } from './context.ts'
export type { ComarkContext, ComarkDocument, ComarkPatch } from './context.ts'

// Re-export types
export type * from './types.ts'

/**
 * Resolve public parser options into core options.
 *
 * Registers the built-in plugins, honors the deprecated `html` flag, and turns
 * `autoClose: true` into a function the core parser can call. Custom auto-close
 * functions and `autoClose: false` pass through unchanged.
 */
function resolveParserOptions<const TPlugins extends readonly ComarkPlugin<any, any>[] = []>(
  options: ParserOptions<TPlugins>
): ParserCoreOptions<ComarkPlugin<any, any>[]> {
  const { autoClose = true, tracer = noopTracer } = options
  const userPlugins = options.plugins ?? []

  // `options.html` is deprecated — prefer `registerDefaultPlugins: false` (or
  // omitting the html plugin from an explicit plugins list).
  if (options.html !== undefined) {
    console.warn(
      '[comark] `ParserOptions.html` is deprecated and will be removed in a future major version. ' +
        'Use `registerDefaultPlugins: false` and register `html()` from `comark/plugins/html` only when needed.'
    )
  }

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

  const plugins = dedupePlugins(defaultPlugins, userPlugins)
  const hasPlugin = (name: string) => plugins.some((plugin) => plugin.name === name)
  const pluginAutoClose = Object.assign({}, ...plugins.map((p) => p.autoClose))

  return {
    ...options,
    plugins,
    tracer,
    autoClose:
      autoClose === true
        ? (markdown, streaming) =>
            autoCloseMarkdown(markdown, {
              ...pluginAutoClose,
              frontmatter: hasPlugin('frontmatter') && streaming,
              syntax: hasPlugin('components'),
              attributes: hasPlugin('components') || hasPlugin('attributes'),
              math: hasPlugin('math'), // enables blockMath + inlineMath
              dropTrailingOpeners: streaming === true,
            })
        : autoClose || undefined,
  }
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
  return createCoreMarkdownParser(resolveParserOptions(options)) as ComarkParseFn<
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
  options: ParserOptions<TPlugins> = {} as ParserOptions<TPlugins>
): ComarkParseFn<ResolvedMeta<MergePluginMeta<TPlugins>>, ResolvedFrontmatter<MergePluginFrontmatter<TPlugins>>> {
  return createSerializedTask(createMarkdownParser(options))
}
