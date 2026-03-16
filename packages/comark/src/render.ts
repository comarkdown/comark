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
export function render(tree: ComarkTree, context: RenderOptions = {}) {
  const state = createState({ ...context, tree, handlers: context.components })

  return tree.nodes.map(child => one(child, state)).join('').trim() + '\n'
}

/**
 * Render Comark tree to markdown
 *
 * @param tree - The Comark tree to render
 * @param options - Optional rendering options
 * @returns The markdown string with optional frontmatter
 */
export function renderMarkdown(tree: ComarkTree, options?: RenderMarkdownOptions): string {
  const content = render(tree, { format: 'markdown/mdc', ...options })
  return renderFrontmatter(tree.frontmatter, content)
}
