import type { MarkdownDocument } from 'comark'
import { compileMjml } from './mjml.ts'
import { resolveEmailConfig } from './config.ts'
import { documentToMjmlJson } from './transform.ts'
import { serializeMjml } from './serialize.ts'
import type { EmailRendererOptions, EmailRenderResult } from './types.ts'

export * from 'comark/render'

/**
 * Render a Markdown document to a compiled MJML email HTML string.
 *
 * Steps:
 *   1. Resolve EmailConfig from frontmatter and options.
 *   2. Build the MJML JSON tree with documentToMjmlJson.
 *   3. Compile to HTML with compileMjml (mjml2html).
 *   4. Return { html, subject, previewText, errors }.
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
  const frontmatter = (document as MarkdownDocument).frontmatter ?? {}
  const emailConfig = resolveEmailConfig(frontmatter, options)

  const mjmlJson = await documentToMjmlJson(document, { ...options, email: emailConfig })
  const { html, errors } = await compileMjml(mjmlJson, options?.mjmlOptions)

  return {
    html,
    subject: emailConfig.subject,
    previewText: emailConfig.previewText,
    errors,
  }
}

/**
 * Convert a Markdown document to an MJML XML string (for tests and debugging).
 *
 * Does not compile to HTML. Use compileMjml to produce the final email output.
 */
export const documentToMjml = async (
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: EmailRendererOptions
): Promise<string> => {
  const frontmatter = (document as MarkdownDocument).frontmatter ?? {}
  const emailConfig = resolveEmailConfig(frontmatter, options)
  const mjmlJson = await documentToMjmlJson(document, { ...options, email: emailConfig })
  return serializeMjml(mjmlJson)
}
