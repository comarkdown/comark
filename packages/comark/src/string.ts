import type { ComarkTree, ComarkElement, ComarkNode } from './ast'
import type { NodeHandler } from './internal/stringify/types'
import { renderFrontmatter } from './internal/front-matter'
import { stringify } from './internal/stringify'

export interface RenderHTMLContext {
  /** Renders the element's children to HTML */
  render: (children: ComarkNode[]) => string
  /** Frontmatter/metadata passed via options.data */
  data?: Record<string, any>
}

export type ComponentRenderFn = (element: ComarkElement, ctx: RenderHTMLContext) => string

export interface RenderHTMLOptions {
  /** Custom component renderers keyed by tag name */
  components?: Record<string, ComponentRenderFn>
  /** Frontmatter data, made available to component renderers */
  data?: Record<string, any>
}

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
 * import { renderHTML } from 'comark/string'
 *
 * const { body } = parse('::alert{type="info"}\nHello!\n::')
 *
 * const html = renderHTML(body, {
 *   components: {
 *     alert: ([tag, attrs, ...children], { render }) => {
 *       return `<div class="alert alert-${attrs.type}">${render(children)}</div>`
 *     }
 *   }
 * })
 * ```
 */
export function renderHTML(tree: ComarkTree, options?: RenderHTMLOptions): string {
  const handlers: Record<string, NodeHandler> = {}

  if (options?.components) {
    for (const [name, renderFn] of Object.entries(options.components)) {
      handlers[name] = (node) => {
        const render = (children: ComarkNode[]) => {
          return renderHTML({ type: 'comark', value: children }, options)
        }
        return renderFn(node, { render, data: options.data })
      }
    }
  }

  return stringify(tree, { format: 'text/html', handlers }).trim()
}

/**
 * Render Comark tree to markdown
 *
 * @param tree - The Comark tree to render
 * @param data - The data to render
 * @returns The markdown string with optional frontmatter
 */
export function renderMarkdown(tree: ComarkTree, data?: Record<string, any> | undefined | null): string {
  return renderFrontmatter(data, stringify(tree, { format: 'markdown/mdc' }))
}
