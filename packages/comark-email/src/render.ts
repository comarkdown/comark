import type { MarkdownDocument } from 'comark'
import { renderHtmlFromDocument } from '@comark/html/render'
import { buildPreheader, DEFAULT_EMAIL_CSS, frontmatterToMaizzleConfig } from './config.ts'
import { compileEmail } from './maizzle.ts'
import { EmailButton } from './plugins/email-button.ts'
import { EmailColumns } from './plugins/email-columns.ts'
import { EmailDivider } from './plugins/email-divider.ts'
import type { EmailConfig, EmailRendererOptions, EmailRenderResult } from './types.ts'

export * from 'comark/render'

/**
 * Wrap an email body and CSS into a complete HTML document.
 * Includes a `<style>@tailwind utilities;</style>` block so Maizzle can resolve
 * Tailwind classes, and an optional hidden preheader for email preview text.
 */
export const assembleEmailHtml = (body: string, css: string, previewText?: string): string => {
  const preheader = previewText ? `\n${buildPreheader(previewText)}` : ''
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<style>\n${css}\n</style>\n</head>\n<body class="comark-email">${preheader}\n${body}\n</body>\n</html>`
}

/**
 * Render a Markdown document to an HTML body string with the built-in email
 * components active. Caller-provided components take precedence.
 */
export const renderEmailBody = async (
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: EmailRendererOptions
): Promise<string> => {
  const components = {
    'email-button': EmailButton,
    'email-columns': EmailColumns,
    'email-divider': EmailDivider,
    ...options?.components,
  }
  return renderHtmlFromDocument(document, { ...options, components })
}

/**
 * Render a Markdown document to a compiled email HTML string.
 *
 * Reads `document.frontmatter.email` for email configuration, merges in
 * `options.email`, assembles the HTML document, then runs Maizzle to inline
 * Tailwind CSS and produce inbox-ready output.
 *
 * @example
 * ```typescript
 * import { parseMarkdown } from 'comark'
 * import { renderEmailFromDocument } from '@comark/email'
 *
 * const doc = await parseMarkdown('---\nemail:\n  subject: Hello\n---\n# Hi')
 * const { html, subject } = await renderEmailFromDocument(doc)
 * ```
 */
export const renderEmailFromDocument = async (
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: EmailRendererOptions
): Promise<EmailRenderResult> => {
  const frontmatterEmail = ((document as MarkdownDocument).frontmatter?.email ?? {}) as EmailConfig
  const emailConfig: EmailConfig = { ...frontmatterEmail, ...options?.email }

  const body = await renderEmailBody(document, options)
  const baseCss = options?.baseCss ?? DEFAULT_EMAIL_CSS
  const css = ['@tailwind utilities;', baseCss].filter(Boolean).join('\n')
  const rawHtml = assembleEmailHtml(body, css, emailConfig.previewText)

  const maizzleConfig = frontmatterToMaizzleConfig(emailConfig, rawHtml, options?.tailwindConfig)
  const mergedConfig = { ...maizzleConfig, ...(options?.maizzleOptions ?? {}) }

  const { html, errors } = await compileEmail(rawHtml, mergedConfig)

  return {
    html,
    subject: emailConfig.subject,
    previewText: emailConfig.previewText,
    errors,
  }
}
