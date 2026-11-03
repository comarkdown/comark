import type { Node, ElementNode } from 'comark'

export { renderHtmlFromDocument } from 'comark/render/html'
export type { HtmlRendererOptions } from 'comark/render/html'
export type { NodeHandler, State, Context, RendererOptions, NodeRenderData } from 'comark/render'

export interface RenderHTMLContext {
  /** Renders the element's children to HTML */
  render: (children: Node[]) => Promise<string>
  /** Frontmatter/metadata passed via options.data */
  data?: Record<string, any>
}

export type ComponentRenderFn = (element: ElementNode, ctx: RenderHTMLContext) => string | Promise<string>
