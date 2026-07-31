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
 * Render Comark tree to HTML
 *
 * @param tree - The Comark tree to render
 * @param options - Optional rendering options with custom components and data
 * @returns The HTML string
 *
 * @example
 * ```typescript
 * import { parseMarkdown } from 'comark'
 * import { renderHtml } from '@comark/html'
 *
 * const tree = await parseMarkdown('::alert{type="info"}\nHello!\n::')
 *
 * const html = renderHtml(tree, {
 *   components: {
 *     alert: ([tag, attrs, ...children], { render }) => {
 *       return `<div class="alert alert-${attrs.type}">${render(children)}</div>`
 *     }
 *   }
 * })
 * ```
 */
export async function renderHtml(
  tree: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: RendererOptions
): Promise<string> {
  return (await render(tree, { blockSeparator: '\n', format: 'text/html', ...options })).trim()
}
