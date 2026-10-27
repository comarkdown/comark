import type { MarkdownDocument, RendererOptions } from '../types.ts'
import { createState, one } from '../internal/stringify/state.ts'
import { html } from '../internal/stringify/handlers/html.ts'
import { comment } from '../internal/stringify/handlers/comment.ts'

export interface HtmlRendererOptions extends RendererOptions {
  blockSeparator?: string
  /** Always `text/html`. Use `render` from `comark/render` for other formats. */
  format?: never
}

const handlers = { html, comment }

/**
 * Render a Markdown document to HTML without loading the Markdown serializers or YAML support.
 *
 * @param document - The parsed Markdown document to render
 * @param options - Optional rendering options with custom components and data
 * @returns The HTML string
 *
 * @example
 * ```typescript
 * import { parseMarkdown } from 'comark'
 * import { renderHtmlFromDocument } from '@comark/html'
 *
 * const document = await parseMarkdown('::alert{type="info"}\nHello!\n::')
 *
 * const html = await renderHtmlFromDocument(document, {
 *   components: {
 *     alert: async ([tag, attrs, ...children], { render }) => {
 *       return `<div class="alert alert-${attrs.type}">${await render(children)}</div>`
 *     }
 *   }
 * })
 * ```
 */
export async function renderHtmlFromDocument(
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options: HtmlRendererOptions = {}
): Promise<string> {
  const state = createState(handlers, {
    blockSeparator: '\n',
    ...options,
    format: 'text/html',
    tree: document as MarkdownDocument,
    handlers: options.components,
  })
  let result = ''
  for (const node of document.nodes) result += await one(node, state)
  return result.trim()
}
