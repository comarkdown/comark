import type { Node, ElementNode, MarkdownDocument } from 'comark'
import { render } from 'comark/render'
import type { RendererOptions } from 'comark/render'

export * from 'comark/render'

export interface RenderHTMLContext {
  /** Renders the element's children to HTML */
  render: (children: Node[]) => Promise<string>
  /** Frontmatter/metadata passed via options.data */
  data?: Record<string, any>
}

export type ComponentRenderFn = (element: ElementNode, ctx: RenderHTMLContext) => string | Promise<string>

/**
 * Render a Markdown document to HTML.
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
  options?: RendererOptions
): Promise<string> {
  return (await render(document, { blockSeparator: '\n', format: 'text/html', ...options })).trim()
}
