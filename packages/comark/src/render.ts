import type { MarkdownDocument, RendererOptions, RenderMarkdownOptions } from 'comark'
import { renderFrontmatter } from './internal/frontmatter.ts'

import { createState, one } from './internal/stringify/state.ts'

export type { NodeHandler, State, Context, RendererOptions, RenderMarkdownOptions, NodeRenderData } from './types.ts'

// Re-export frontmatter renderer
export { renderFrontmatter } from './internal/frontmatter.ts'

// Re-export attribute resolvers for custom handlers that want to honor `:prefix` bindings
export { resolveAttributes, resolveAttribute } from './internal/stringify/attributes.ts'

/**
 * Generate a string from a Comark tree
 * @param tree - The Comark tree to render
 * @param context - The context of the renderer
 * @returns The string representation of the Comark tree
 */
export async function render(
  tree: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  context: RendererOptions = {}
): Promise<string> {
  const state = createState({ ...context, tree: tree as MarkdownDocument, handlers: context.components })

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
export async function renderMarkdown(
  tree: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: RenderMarkdownOptions
): Promise<string> {
  const content = await render(tree, { format: 'markdown/comark', ...options })
  return renderFrontmatter((tree as MarkdownDocument).frontmatter || {}, content, options?.frontmatterOptions)
}
