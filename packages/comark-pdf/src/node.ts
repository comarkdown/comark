import { writeFile } from 'node:fs/promises'
import { renderPdf, renderPdfFromDocument } from './index.ts'
import type { PdfRendererOptions } from './types.ts'
import type { MarkdownDocument } from 'comark'

export { renderPdfFromDocument }

/**
 * Render markdown to a PDF Uint8Array using jasy.
 *
 * @example
 * ```typescript
 * import { renderPdfToBuffer } from '@comark/pdf/node'
 * import { writeFile } from 'node:fs/promises'
 *
 * const buffer = await renderPdfToBuffer('# Hello', {
 *   pdf: { format: 'A4', margin: '20mm', footer: 'Page {{ page }} of {{ totalPages }}' },
 * })
 * await writeFile('output.pdf', buffer)
 * ```
 */
export const renderPdfToBuffer = (markdown: string, options?: PdfRendererOptions): Promise<Uint8Array> =>
  renderPdf(markdown, options)

/**
 * Render markdown to a PDF file using jasy.
 *
 * @example
 * ```typescript
 * import { renderPdfToFile } from '@comark/pdf/node'
 *
 * await renderPdfToFile('# Hello', 'output.pdf', {
 *   pdf: { format: 'A4', margin: '20mm' },
 * })
 * ```
 */
export const renderPdfToFile = async (
  markdown: string,
  outputPath: string,
  options?: PdfRendererOptions,
): Promise<void> => {
  const buffer = await renderPdfToBuffer(markdown, options)
  await writeFile(outputPath, buffer)
}
