import type { ParserOptions, RendererOptions } from 'comark'

export interface PdfMargin {
  top?: string
  right?: string
  bottom?: string
  left?: string
}

export interface PdfPageConfig {
  /** Named page format or custom dimensions (e.g. 'A4', 'Letter', '210mm 297mm'). Default: 'A4'. */
  format?: string
  /** Page orientation. Default: 'portrait'. */
  orientation?: 'portrait' | 'landscape'
  /** Page margin as a shorthand string (e.g. '20mm') or per-side object. Default: '20mm'. */
  margin?: string | PdfMargin
  /** Center header text. Tokens: {{ page }}, {{ totalPages }}. */
  header?: string
  /** Left header text. */
  headerLeft?: string
  /** Right header text. */
  headerRight?: string
  /** Center footer text. Tokens: {{ page }}, {{ totalPages }}. */
  footer?: string
  /** Left footer text. */
  footerLeft?: string
  /** Right footer text. */
  footerRight?: string
}

export interface PdfRendererOptions extends ParserOptions, RendererOptions {
  /** Explicit PDF page configuration. Merged over frontmatter.pdf. */
  pdf?: PdfPageConfig
  /** Additional CSS injected into the document <style> block. */
  baseCss?: string
}

/** Minimal interface satisfied by a Playwright Browser (or compatible headless browser). */
export interface PdfBrowser {
  newPage(): Promise<PdfPage>
  close(): Promise<void>
}

/** Minimal interface satisfied by a Playwright Page. */
export interface PdfPage {
  addInitScript(script: string): Promise<void>
  setContent(html: string, options?: { waitUntil?: string }): Promise<void>
  addScriptTag(options: { path?: string; content?: string }): Promise<unknown>
  evaluate<T>(fn: () => T | Promise<T>): Promise<T>
  pdf(options?: Record<string, unknown>): Promise<Uint8Array>
  close(): Promise<void>
}

export interface PdfNodeOptions extends PdfRendererOptions {
  /** Pre-launched browser instance. When provided, the caller is responsible for closing it. */
  browser?: PdfBrowser
  /** Options forwarded to chromium.launch() when launching internally. */
  launchOptions?: Record<string, unknown>
  /** Options forwarded to page.pdf() (Playwright PDFOptions). */
  pdfOptions?: Record<string, unknown>
}
