import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { renderPdf } from './index.ts'
import type { PdfBrowser, PdfNodeOptions, PdfPage } from './types.ts'

const require = createRequire(import.meta.url)

const launchBrowser = async (launchOptions?: Record<string, unknown>): Promise<PdfBrowser> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { chromium } = (await import('playwright')) as any
  return chromium.launch(launchOptions)
}

const getPagedPolyfillPath = (): string => {
  // pagedjs exports map blocks ./dist/* and ./package.json subpaths — resolve the entry, then walk to dist.
  let polyfillPath: string
  try {
    polyfillPath = join(dirname(require.resolve('pagedjs')), '..', 'dist', 'paged.polyfill.js')
  } catch {
    throw new Error('[@comark/pdf] pagedjs is required for PDF export. Install it: pnpm add -D pagedjs')
  }
  if (!existsSync(polyfillPath)) {
    throw new Error(`[@comark/pdf] pagedjs polyfill not found at ${polyfillPath}`)
  }
  return polyfillPath
}

const runPagedInPage = async (page: PdfPage, html: string, pdfOptions: Record<string, unknown>): Promise<Uint8Array> => {
  const pagedPolyfillPath = getPagedPolyfillPath()

  // Disable paged.js auto-run so we control when pagination triggers.
  await page.addInitScript('window.PagedConfig = { auto: false }')
  await page.setContent(html, { waitUntil: 'load' })
  await page.addScriptTag({ path: pagedPolyfillPath })

  // Run pagination and wait for it to complete (pagedjs-cli proven pattern).
  await page.evaluate(() => (window as unknown as { PagedPolyfill: { preview(): Promise<unknown> } }).PagedPolyfill.preview())

  return page.pdf({ printBackground: true, preferCSSPageSize: true, ...pdfOptions })
}

/**
 * Render markdown to a PDF Uint8Array using paged.js and Playwright.
 *
 * Requires both `pagedjs` and `playwright` optional peers to be installed.
 * Pass `options.browser` to reuse an existing Playwright browser instance; when omitted,
 * a Chromium instance is launched and closed automatically.
 *
 * @example
 * ```typescript
 * import { renderPdfToBuffer } from '@comark/pdf/node'
 *
 * const buffer = await renderPdfToBuffer('# Hello', {
 *   pdf: { format: 'A4', margin: '20mm', footer: 'Page {{ page }} of {{ totalPages }}' },
 * })
 * await fs.writeFile('output.pdf', buffer)
 * ```
 */
export const renderPdfToBuffer = async (markdown: string, options?: PdfNodeOptions): Promise<Uint8Array> => {
  const html = await renderPdf(markdown, options)
  const { browser: injectedBrowser, launchOptions, pdfOptions = {} } = options ?? {}

  let browser: PdfBrowser | undefined = injectedBrowser
  let ownBrowser = false

  if (!browser) {
    browser = await launchBrowser(launchOptions)
    ownBrowser = true
  }

  let page: PdfPage | undefined
  try {
    page = await browser.newPage()
    return await runPagedInPage(page, html, pdfOptions)
  } finally {
    await page?.close()
    if (ownBrowser) await browser.close()
  }
}

/**
 * Render markdown to a PDF file using paged.js and Playwright.
 *
 * Convenience wrapper around `renderPdfToBuffer` that writes the output to `outputPath`.
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
export const renderPdfToFile = async (markdown: string, outputPath: string, options?: PdfNodeOptions): Promise<void> => {
  const buffer = await renderPdfToBuffer(markdown, options)
  await writeFile(outputPath, buffer)
}
