import type { MarkdownDocument } from 'comark'
import { renderHtmlFromDocument } from '@comark/html/render'
import { DEFAULT_BASE_CSS, frontmatterToPageCss } from './css.ts'
import { PageBreak } from './plugins/page-break.ts'
import type { PdfPageConfig, PdfRendererOptions } from './types.ts'

export * from 'comark/render'

/**
 * Assemble a complete paged-media HTML document from a rendered body and CSS string.
 * The document is ready to be served in a browser with paged.js or passed to a headless PDF exporter.
 */
export const assemblePagedHtml = (body: string, css: string): string =>
  `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<style>\n${css}\n</style>\n</head>\n<body class="comark-pdf">\n${body}\n</body>\n</html>`

/**
 * Render a Markdown document to an HTML body string, with the `::page-break` component active.
 * Merges caller-provided components so user-defined handlers take precedence.
 */
export const renderPdfBody = async (
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: PdfRendererOptions
): Promise<string> => {
  const components = { 'page-break': PageBreak, ...options?.components }
  return renderHtmlFromDocument(document, { ...options, components })
}

/**
 * Render a Markdown document to a complete paged-media HTML document string.
 *
 * Reads `document.frontmatter.pdf` for page configuration, merges in `options.pdf`,
 * and wraps the rendered body in a full HTML document with embedded `@page` CSS.
 *
 * @example
 * ```typescript
 * import { parseMarkdown } from 'comark'
 * import { renderPdfFromDocument } from '@comark/pdf'
 *
 * const doc = await parseMarkdown('---\npdf:\n  format: A4\n---\n# Hello')
 * const html = await renderPdfFromDocument(doc)
 * ```
 */
export const renderPdfFromDocument = async (
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: PdfRendererOptions
): Promise<string> => {
  const frontmatterPdf = ((document as MarkdownDocument).frontmatter?.pdf ?? {}) as PdfPageConfig
  const pdfConfig: PdfPageConfig = { ...frontmatterPdf, ...options?.pdf }
  const pageCss = frontmatterToPageCss(pdfConfig)
  const baseCss = options?.baseCss ?? DEFAULT_BASE_CSS
  const css = [baseCss, pageCss].filter(Boolean).join('\n')
  const body = await renderPdfBody(document, options)
  return assemblePagedHtml(body, css)
}
