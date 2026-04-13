import type { ComarkTree, RenderOptions, RenderMarkdownOptions } from 'comark'
import { renderFrontmatter } from './internal/frontmatter.ts'

import { createState, one } from './internal/stringify/state.ts'

export type { NodeHandler, State, Context, RenderOptions, RenderMarkdownOptions } from './types.ts'

// Re-export frontmatter renderer
export { renderFrontmatter } from './internal/frontmatter.ts'

/**
 * Generate a string from a Comark tree
 * @param tree - The Comark tree to render
 * @param context - The context of the renderer
 * @returns The string representation of the Comark tree
 */
export async function render(tree: ComarkTree, context: RenderOptions = {}): Promise<string> {
  const state = createState({ ...context, tree, handlers: context.components })

  let result = ''
  for (const child of tree.nodes) {
    result += await one(child, state)
  }
  return result.trim() + '\n'
}

/**
 * Render Comark tree to markdown
 *
 * @param tree - The Comark tree to render
 * @param options - Optional rendering options
 * @returns The markdown string with optional frontmatter
 */
export async function renderMarkdown(tree: ComarkTree, options?: RenderMarkdownOptions): Promise<string> {
  const content = await render(tree, { format: 'markdown/comark', ...options })
  return renderFrontmatter(tree.frontmatter, content, options?.frontmatterOptions)
}
