import type { ParseOptions } from 'comark'
import { createParse } from 'comark'
import { stringify, type NodeHandler } from 'comark/string'
import type { ComarkTree, ComarkNode, ComarkElement } from 'comark/ast'

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
export function renderHTML(tree: ComarkTree, options?: RenderHTMLOptions): string {
  const handlers: Record<string, NodeHandler> = {}

  if (options?.components) {
    for (const [name, renderFn] of Object.entries(options.components)) {
      handlers[name] = (node) => {
        const render = (children: ComarkNode[]) => {
          return renderHTML({ nodes: children, frontmatter: {}, meta: {} }, options)
        }
        return renderFn(node, { render, data: options.data })
      }
    }
  }

  return stringify(tree, { format: 'text/html', handlers }).trim()
}

/**
 * Options for parse+render pipelines.
 */
export interface RenderOptions {
  /** Comark parse options (plugins, autoClose, etc.) */
  parse?: ParseOptions
  /** HTML rendering options (components, data) */
  render?: RenderHTMLOptions
}

/**
 * Creates a reusable parse+render function with pre-configured options.
 * The underlying parser is initialized once and reused on every call.
 *
 * @param options - Parse and render options
 * @returns An async function `(markdown) => Promise<string>` that returns HTML
 *
 * @example
 * ```typescript
 * import { createRender } from '@comark/html'
 * import highlight from 'comark/plugins/highlight'
 *
 * const render = createRender({
 *   parse: { plugins: [highlight()] },
 *   render: {
 *     components: {
 *       alert: ([, attrs, ...children], { render }) =>
 *         `<div class="alert alert-${attrs.type}">${render(children)}</div>`
 *     }
 *   }
 * })
 *
 * const html = await render('# Hello\n\n**Bold** text.')
 * ```
 */
export function createRender(options?: RenderOptions): (markdown: string) => Promise<string> {
  const parse = createParse(options?.parse ?? {})

  return async (markdown: string) => {
    const tree = await parse(markdown)
    return renderHTML(tree, options?.render)
  }
}

/**
 * Parse markdown and render it to an HTML string.
 *
 * @param markdown - The markdown/Comark content to render
 * @param options - Optional parse and render options
 * @returns A Promise resolving to the HTML string
 *
 * @example
 * ```typescript
 * import { render } from '@comark/html'
 *
 * const html = await render('# Hello\n\nThis is **bold** and _italic_.')
 * document.body.innerHTML = html
 * ```
 */
export async function render(markdown: string, options?: RenderOptions): Promise<string> {
  return createRender(options)(markdown)
}
