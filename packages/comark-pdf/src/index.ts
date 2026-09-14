import { createMarkdownParser } from 'comark'
import { renderPdfBytes, renderPdfDocument, renderPdfFromDocument } from './render.ts'
import type { PdfPageConfig, PdfRendererOptions } from './types.ts'

export { renderPdfDocument, renderPdfBytes, renderPdfFromDocument } from './render.ts'
export type { PdfMargin, PdfPageConfig, PdfRendererOptions, PdfEncryptOptions, PdfJustify, PdfAlign, PdfTextAlign, PdfOverflowPolicy } from './types.ts'
export type { JasyComponentFn, JasyMapContext, JasyTextDefaults } from './jasy.ts'
export {
  pdfConfigToPageProps,
  pdfConfigToDocumentOptions,
  pdfConfigToRenderOptions,
  resolveContentGap,
  resolveJasyMargin,
  resolveJasySize,
  resolveJasyCustomSize,
  parseLengthToPt,
} from './page.ts'

/**
 * Creates a reusable parse+render function with pre-configured options.
 * Returns a function that accepts markdown and produces PDF bytes.
 * The underlying parser is initialized once and reused on every call.
 *
 * @example
 * ```typescript
 * import { createPdfRenderer } from '@comark/pdf'
 *
 * const renderPdf = createPdfRenderer({
 *   plugins: [],
 *   pdf: { format: 'A4', margin: '20mm', footer: 'Page {{ page }} of {{ totalPages }}' },
 * })
 *
 * const bytes = await renderPdf('# Hello\n\n**Bold** text.')
 * ```
 */
export const createPdfRenderer = (options?: PdfRendererOptions): ((markdown: string) => Promise<Uint8Array>) => {
  const parseMarkdown = createMarkdownParser(options)
  return async (markdown: string) => {
    const document = await parseMarkdown(markdown)
    return renderPdfBytes(document, options)
  }
}

/**
 * Parse markdown and render it to PDF bytes.
 *
 * @example
 * ```typescript
 * import { renderPdf } from '@comark/pdf'
 * import { writeFile } from 'node:fs/promises'
 *
 * const bytes = await renderPdf('# Hello', {
 *   pdf: { format: 'A4', margin: '25mm', footer: 'Page {{ page }} of {{ totalPages }}' },
 * })
 * await writeFile('output.pdf', bytes)
 * ```
 */
export const renderPdf = (markdown: string, options?: PdfRendererOptions): Promise<Uint8Array> =>
  createPdfRenderer(options)(markdown)
