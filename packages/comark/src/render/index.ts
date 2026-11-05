import type { MarkdownDocument, RendererOptions, RenderMarkdownOptions } from 'comark'

import { createState, one } from '../internal/stringify/state.ts'
import { handlers } from '../internal/stringify/handlers/index.ts'

export type {
  NodeHandler,
  State,
  Context,
  RendererOptions,
  RenderMarkdownOptions,
  NodeRenderData,
  NodeTransform,
  NodeTransformContext,
  NodeTransformResult,
} from '../types.ts'

// Re-export attribute resolvers for custom handlers that want to honor `:prefix` bindings
export { resolveAttributes, resolveAttribute } from '../internal/stringify/attributes.ts'

/**
 * Generate a string from a Markdown document
 * @param document - The Markdown document to render
 * @param context - The context of the renderer
 * @returns The string representation of the Markdown document
 */
export async function render(
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  context: RendererOptions = {}
): Promise<string> {
  const state = createState(handlers, { ...context, tree: document as MarkdownDocument, handlers: context.components })

  let result = ''
  for (const child of document.nodes) {
    result += await one(child, state)
  }
  return result.trim() + '\n'
}

/**
 * Render a Markdown document to markdown
 *
 * @param document - The Markdown document to render
 * @param options - Optional rendering options
 * @returns The markdown string with optional frontmatter
 */
export async function renderMarkdown(
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: RenderMarkdownOptions
): Promise<string> {
  const content = await render(document, { format: 'markdown/comark', ...options })
  const frontmatter = (document as MarkdownDocument).frontmatter
  if (!frontmatter || Object.keys(frontmatter).length === 0) return content.trim()
  // The YAML serializer loads only for documents that have frontmatter.
  const { renderFrontmatter } = await import('../internal/stringify/frontmatter.ts')
  return renderFrontmatter(frontmatter, content, options?.frontmatterOptions)
}
