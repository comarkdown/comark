import type {
  ElementNode,
  MarkdownDocument,
  Node,
  NodeHandler,
  NodeRenderData,
  ConditionalNodeHandler,
  State,
} from '../types.ts'
import { createState, one } from '../internal/stringify/state.ts'
import { html } from '../internal/stringify/handlers/html.ts'
import { comment } from '../internal/stringify/handlers/comment.ts'

export interface HtmlRenderContext {
  render: (children: Node[] | ElementNode) => Promise<string>
  data: Record<string, unknown>
  renderData: NodeRenderData
}

export type HtmlComponent = (
  node: ElementNode,
  context: HtmlRenderContext,
  parent?: ElementNode
) => string | Promise<string>

export interface ConditionalHtmlComponent {
  match: (node: ElementNode) => boolean
  handler: HtmlComponent
}

export interface HtmlRendererOptions {
  components?: Record<string, HtmlComponent | ConditionalHtmlComponent>
  data?: Record<string, unknown>
  blockSeparator?: string
}

const handlers = { html, comment }

function wrap(component: HtmlComponent): NodeHandler {
  return (node: ElementNode, state: State, parent?: ElementNode): string | Promise<string> =>
    component(node, { render: state.render, data: state.data, renderData: state.renderData }, parent)
}

/** Render HTML without loading the Markdown serializer or YAML support. */
export async function renderHtmlFromDocument(
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options: HtmlRendererOptions = {}
): Promise<string> {
  const components: Record<string, NodeHandler | ConditionalNodeHandler> = Object.create(null)
  for (const [name, component] of Object.entries(options.components || {})) {
    components[name] =
      typeof component === 'function' ? wrap(component) : { match: component.match, handler: wrap(component.handler) }
  }
  const state = createState(handlers, {
    format: 'text/html',
    blockSeparator: options.blockSeparator ?? '\n',
    tree: document as MarkdownDocument,
    data: options.data,
    handlers: components,
  })
  let result = ''
  for (const node of document.nodes) result += await one(node, state)
  return result.trim()
}
