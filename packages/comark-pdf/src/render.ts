import { Document, Page, Column, renderToBytes } from '@jasy/pdf'
import type { MarkdownDocument } from 'comark'
import { astToJasy } from './jasy.ts'
import {
  pdfConfigToDocumentOptions,
  pdfConfigToPageProps,
  pdfConfigToRenderOptions,
  resolveContentGap,
} from './page.ts'
import type { PdfPageConfig, PdfRendererOptions } from './types.ts'

export * from 'comark/render'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JasyDocument = any

/**
 * Build a jasy Document tree from a parsed Markdown document.
 *
 * Reads `document.frontmatter.pdf` for page configuration, merges in `options.pdf`,
 * then maps the AST nodes to jasy layout primitives.
 *
 * @example
 * ```typescript
 * import { parseMarkdown } from 'comark'
 * import { renderPdfDocument } from '@comark/pdf/render'
 *
 * const doc = await parseMarkdown('---\npdf:\n  format: A4\n---\n# Hello')
 * const jasyDoc = renderPdfDocument(doc)
 * ```
 */
export const renderPdfDocument = (
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: PdfRendererOptions,
): JasyDocument => {
  const frontmatterPdf = ((document as MarkdownDocument).frontmatter?.pdf ?? {}) as PdfPageConfig
  const pdfConfig: PdfPageConfig = { ...frontmatterPdf, ...options?.pdf }
  const pageProps = pdfConfigToPageProps(pdfConfig)
  const documentOpts = pdfConfigToDocumentOptions(pdfConfig)
  const gap = resolveContentGap(pdfConfig)

  const textDefaults = documentOpts
    ? {
        size: documentOpts.size,
        font: documentOpts.font,
        color: typeof documentOpts.color === 'string' ? documentOpts.color : undefined,
        lineHeight: documentOpts.lineHeight,
        align: documentOpts.align,
        bold: documentOpts.bold,
        italic: documentOpts.italic,
      }
    : undefined

  const nodes = astToJasy(document.nodes, options?.components, textDefaults)
  const content = nodes.length > 0 ? nodes : []
  const page = Page(pageProps, [Column({ gap }, content)])

  return documentOpts ? Document(documentOpts, [page]) : Document([page])
}

/**
 * Render a Markdown document to a PDF Uint8Array.
 *
 * @example
 * ```typescript
 * import { parseMarkdown } from 'comark'
 * import { renderPdfBytes } from '@comark/pdf/render'
 *
 * const doc = await parseMarkdown('# Hello')
 * const bytes = await renderPdfBytes(doc, { pdf: { format: 'A4', margin: '20mm' } })
 * ```
 */
export const renderPdfBytes = (
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: PdfRendererOptions,
): Promise<Uint8Array> => {
  const frontmatterPdf = ((document as MarkdownDocument).frontmatter?.pdf ?? {}) as PdfPageConfig
  const pdfConfig: PdfPageConfig = { ...frontmatterPdf, ...options?.pdf }
  const renderOpts = pdfConfigToRenderOptions(pdfConfig, options?.fonts)
  return renderToBytes(renderPdfDocument(document, options), renderOpts)
}

/**
 * Alias retained for compatibility — use `renderPdfBytes` for the recommended name.
 */
export const renderPdfFromDocument = renderPdfBytes
