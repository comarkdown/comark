import type { ParserOptions, RendererOptions } from 'comark'

export interface EmailTheme {
  primary?: string
  background?: string
  [key: string]: string | undefined
}

export interface EmailConfig {
  /** Email subject line. Extracted from frontmatter and returned in EmailRenderResult. */
  subject?: string
  /** Short preview text shown by email clients before the body. Injected as a hidden preheader. */
  previewText?: string
  /** Theme color overrides mapped to Tailwind CSS custom colors. */
  theme?: EmailTheme
}

export interface EmailRendererOptions extends ParserOptions, RendererOptions {
  /** Explicit email configuration. Merged over frontmatter.email. */
  email?: EmailConfig
  /** Extra Tailwind CSS configuration merged into the Maizzle tailwind config. */
  tailwindConfig?: Record<string, unknown>
  /** Extra options forwarded directly to Maizzle render(). Merged last, overrides all computed config. */
  maizzleOptions?: Record<string, unknown>
  /** Additional CSS injected into the document <style> block before @tailwind utilities. */
  baseCss?: string
}

export interface EmailRenderResult {
  /** Compiled, inline-styled HTML ready to pass to an email service provider. */
  html: string
  /** Subject line extracted from frontmatter.email.subject or options.email.subject. */
  subject?: string
  /** Preview text extracted from frontmatter.email.previewText or options.email.previewText. */
  previewText?: string
  /** Any errors collected during Maizzle compilation. Empty on success. */
  errors: unknown[]
}
