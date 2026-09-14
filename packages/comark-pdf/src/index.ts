import { createMarkdownParser } from 'comark'
import { renderPdfFromDocument } from './render.ts'
import type { PdfRendererOptions } from './types.ts'

export { assemblePagedHtml, renderPdfBody, renderPdfFromDocument } from './render.ts'
export type { PdfBrowser, PdfMargin, PdfNodeOptions, PdfPage, PdfPageConfig, PdfRendererOptions } from './types.ts'

/**
 * Creates a reusable parse+render function with pre-configured options.
 * Returns a function that accepts markdown and produces a complete paged-media HTML document string.
 * The underlying parser is initialized once and reused on every call.
 *
 * @example
 * ```typescript
 * import { createPdfRenderer } from '@comark/pdf'
 * import shiki from '@comark/pdf/plugins/shiki'
 *
 * const renderPdf = createPdfRenderer({
 *   plugins: [shiki()],
 *   pdf: { format: 'A4', margin: '20mm', footer: 'Page {{ page }} of {{ totalPages }}' },
 * })
 *
 * const html = await renderPdf('# Hello\n\n**Bold** text.')
 * ```
 */
export const createPdfRenderer = (options?: PdfRendererOptions): ((markdown: string) => Promise<string>) => {
  const parseMarkdown = createMarkdownParser(options)
  return async (markdown: string) => {
    const document = await parseMarkdown(markdown)
    return renderPdfFromDocument(document, options)
  }
}

/**
 * Parse markdown and render it to a complete paged-media HTML document string.
 *
 * @example
 * ```typescript
 * import { renderPdf } from '@comark/pdf'
 *
 * const html = await renderPdf('# Hello', {
 *   pdf: { format: 'A4', margin: '25mm', footer: 'Page {{ page }} of {{ totalPages }}' },
 * })
 * ```
 */
export const renderPdf = (markdown: string, options?: PdfRendererOptions): Promise<string> =>
  createPdfRenderer(options)(markdown)
