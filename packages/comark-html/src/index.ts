import type { ParserOptions, RendererOptions } from 'comark'
import { createMarkdownParser } from 'comark'
import { renderHtml } from './render.ts'

export { renderHtml } from './render.ts'

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
 *   plugins: [highlight()],
 *   components: {
 *     alert: ([, attrs, ...children], { render }) =>
 *       `<div class="alert alert-${attrs.type}">${render(children)}</div>`
 *   }
 * })
 *
 * const html = await render('# Hello\n\n**Bold** text.')
 * ```
 */
export function createRender(options?: ParserOptions & RendererOptions): (markdown: string) => Promise<string> {
  const parse = createMarkdownParser(options)
  return async (markdown: string) => {
    const tree = await parse(markdown)
    return await renderHtml(tree, options as RendererOptions)
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
export async function render(markdown: string, options?: RendererOptions): Promise<string> {
  return createRender(options)(markdown)
}
