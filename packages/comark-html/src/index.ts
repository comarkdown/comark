import type { ParserOptions, RendererOptions } from 'comark'
import { createMarkdownParser } from 'comark'
import { renderHtmlFromDocument } from './render.ts'

export { renderHtmlFromDocument } from './render.ts'

/**
 * Creates a reusable parse+render function with pre-configured options.
 * The underlying parser is initialized once and reused on every call.
 *
 * @param options - Parse and render options
 * @returns An async function `(markdown) => Promise<string>` that returns HTML
 *
 * @example
 * ```typescript
 * import { createHtmlRenderer } from '@comark/html'
 * import shiki from '@comark/html/plugins/shiki'
 *
 * const renderHtml = createHtmlRenderer({
 *   plugins: [shiki()],
 *   components: {
 *     alert: async ([, attrs, ...children], { render }) =>
 *       `<div class="alert alert-${attrs.type}">${await render(children)}</div>`
 *   }
 * })
 *
 * const html = await renderHtml('# Hello\n\n**Bold** text.')
 * ```
 */
export function createHtmlRenderer(options?: ParserOptions & RendererOptions): (markdown: string) => Promise<string> {
  const parseMarkdown = createMarkdownParser(options)
  return async (markdown: string) => {
    const document = await parseMarkdown(markdown)
    return await renderHtmlFromDocument(document, options as RendererOptions)
  }
}

/**
 * Parse markdown and render it to an HTML string.
 *
 * @param markdown - The markdown content to parse and render
 * @param options - Optional parse and render options
 * @returns A Promise resolving to the HTML string
 *
 * @example
 * ```typescript
 * import { renderHtml } from '@comark/html'
 *
 * const html = await renderHtml('# Hello\n\nThis is **bold** and _italic_.')
 * document.body.innerHTML = html
 * ```
 */
export async function renderHtml(markdown: string, options?: ParserOptions & RendererOptions): Promise<string> {
  return createHtmlRenderer(options)(markdown)
}
