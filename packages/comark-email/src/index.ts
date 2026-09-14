import { createMarkdownParser } from 'comark'
import { renderEmailFromDocument } from './render.ts'
import type { EmailRendererOptions, EmailRenderResult } from './types.ts'

export { assembleEmailHtml, renderEmailBody, renderEmailFromDocument } from './render.ts'
export type { EmailConfig, EmailRendererOptions, EmailRenderResult, EmailTheme } from './types.ts'

/**
 * Creates a reusable parse+render function with pre-configured options.
 * Returns a function that accepts markdown and produces a compiled email result.
 * The underlying parser is initialized once and reused on every call.
 *
 * @example
 * ```typescript
 * import { createEmailRenderer } from '@comark/email'
 *
 * const render = createEmailRenderer({
 *   email: { theme: { primary: '#0066cc' } },
 * })
 *
 * const { html, subject } = await render(markdownString)
 * ```
 */
export const createEmailRenderer = (
  options?: EmailRendererOptions
): ((markdown: string) => Promise<EmailRenderResult>) => {
  const parseMarkdown = createMarkdownParser(options)
  return async (markdown: string) => {
    const document = await parseMarkdown(markdown)
    return renderEmailFromDocument(document, options)
  }
}

/**
 * Parse markdown and render it to a compiled email result.
 *
 * @example
 * ```typescript
 * import { renderEmail } from '@comark/email'
 *
 * const { html, subject, previewText } = await renderEmail(`
 * ---
 * email:
 *   subject: Hello!
 *   previewText: Read this important message.
 * ---
 *
 * # Hello
 * `)
 * ```
 */
export const renderEmail = (markdown: string, options?: EmailRendererOptions): Promise<EmailRenderResult> =>
  createEmailRenderer(options)(markdown)
