import type { ComarkParsePostState, ParseOptions } from './types'
import MarkdownIt from 'markdown-it'
import pluginMdc from 'markdown-it-mdc'
import comarkTaskList from './plugins/task-list'
import { applyAutoUnwrap } from './internal/parse/auto-unwrap'
import type { ComarkTree, ComarkNode } from 'comark/ast'
import { marmdownItTokensToComarkTree } from './internal/parse/token-processor'
import { autoCloseMarkdown } from './internal/parse/auto-close/index'
import { parseFrontmatter } from './internal/front-matter'

// Re-export ComarkTree and ComarkNode for convenience
export type { ComarkTree, ComarkNode } from 'comark/ast'

// Re-export auto-close utilities
export { autoCloseMarkdown } from './internal/parse/auto-close'

// Re-export parse utilities
export { applyAutoUnwrap } from './internal/parse/auto-unwrap'

// Re-export types
export type * from './types'

/**
 * Parse Comark content from a string
 *
 * @param markdown - The markdown/Comark content as a string
 * @param options - Parser options
 * @returns ComarkTree - The parsed AST tree
 *
 * @example
 * ```typescript
 * import { parse } from 'comark'
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
 * const tree = await parse(content)
 * console.log(tree.nodes)        // Array of AST nodes
 * console.log(tree.frontmatter)  // { title: 'Hello World' }
 * console.log(tree.meta)         // Additional metadata
 *
 * // Disable auto-unwrap
 * const tree2 = await parse(content, { autoUnwrap: false })
 * ```
 */
export async function parse(markdown: string, options: ParseOptions = {}): Promise<ComarkTree> {
  const { autoUnwrap = true, autoClose = true, plugins = [] } = options

  plugins.unshift(comarkTaskList())

  const state = {
    options,
    tokens: [] as unknown[],
    markdown,
    tree: null as ComarkTree | null,
  }

  if (autoClose) {
    state.markdown = autoCloseMarkdown(state.markdown)
  }

  for (const plugin of options.plugins || []) {
    await plugin.pre?.(state)
  }

  const { content, data } = await parseFrontmatter(state.markdown)

  // Enable tables, GFM features
  const markdownIt = new MarkdownIt({
    html: true,
    linkify: true,
  })
    .enable(['table', 'strikethrough'])
    .use(pluginMdc)

  for (const plugin of options.plugins || []) {
    for (const markdownItPlugin of (plugin.markdownItPlugins || [])) {
      markdownIt.use(markdownItPlugin)
    }
  }

  state.tokens = markdownIt.parse(content, {})

  // Convert tokens to Comark structure
  let nodes: ComarkNode[] = marmdownItTokensToComarkTree(state.tokens)

  if (autoUnwrap) {
    nodes = nodes.map((node: ComarkNode) => applyAutoUnwrap(node))
  }

  state.tree = {
    nodes,
    frontmatter: data,
    meta: {},
  }

  for (const plugin of plugins || []) {
    await plugin.post?.(state as ComarkParsePostState)
  }

  return state.tree
}
