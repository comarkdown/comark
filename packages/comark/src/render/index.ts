import type { MarkdownDocument, RendererOptions, RenderMarkdownOptions } from 'comark'
import { renderFrontmatter } from '../internal/frontmatter.ts'

import { createState, one } from '../internal/stringify/state.ts'
import { handlers as markdownHandlers } from '../internal/stringify/handlers/index.ts'
import { mdc } from '../internal/stringify/handlers/mdc.ts'

export type {
  NodeHandler,
  State,
  FlowOptions,
  Context,
  RendererOptions,
  RenderMarkdownOptions,
  NodeRenderData,
  NodeTransform,
  NodeTransformContext,
  NodeTransformResult,
} from '../types.ts'

export { renderFrontmatter } from '../internal/frontmatter.ts'

const handlers = { ...markdownHandlers, mdc }

// Re-export attribute resolvers for custom handlers that want to honor `:prefix` bindings
export { resolveAttributes, resolveAttribute } from '../internal/stringify/attributes.ts'

/** Render a Markdown document to a string in the configured format. */
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

/** Render a Markdown document to Comark markdown, including frontmatter when present. */
export async function renderMarkdown(
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: RenderMarkdownOptions
): Promise<string> {
  const content = await render(document, { format: 'markdown/comark', ...options })
  return renderFrontmatter((document as MarkdownDocument).frontmatter || {}, content, options?.frontmatterOptions)
}
