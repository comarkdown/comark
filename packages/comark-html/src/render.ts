import type { ComarkNode, ComarkElement, ComarkTree } from 'comark'
import { render } from 'comark/render'
import type { RenderOptions } from 'comark/render'

export * from 'comark/render'

export interface RenderHTMLContext {
  /** Renders the element's children to HTML */
  render: (children: ComarkNode[]) => string
  /** Frontmatter/metadata passed via options.data */
  data?: Record<string, any>
}

export type ComponentRenderFn = (element: ComarkElement, ctx: RenderHTMLContext) => string

/**
 * Render Comark tree to HTML
 *
 * @param tree - The Comark tree to render
 * @param options - Optional rendering options with custom components and data
 * @returns The HTML string
 *
 * @example
 * ```typescript
 * import { parse } from 'comark'
 * import { renderHTML } from '@comark/html'
 *
 * const tree = await parse('::alert{type="info"}\nHello!\n::')
 *
 * const html = renderHTML(tree, {
 *   components: {
 *     alert: ([tag, attrs, ...children], { render }) => {
 *       return `<div class="alert alert-${attrs.type}">${render(children)}</div>`
 *     }
 *   }
 * })
 * ```
 */
export function renderHTML(tree: ComarkTree, options?: RenderOptions): string {
  return render(tree, { blockSeparator: '\n', format: 'text/html', ...options }).trim()
}
