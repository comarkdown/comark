import type { ParserOptions, RendererOptions } from 'comark'

export interface EmailTheme {
  primary?: string
  background?: string
  [key: string]: string | undefined
}

export interface EmailConfig {
  /** Email subject line. Extracted from frontmatter and returned in EmailRenderResult. */
  subject?: string
  /** Short preview text shown by email clients before the body. Injected via mj-preview. */
  previewText?: string
  /**
   * Default button background color. Applied to mj-button via mj-attributes.
   * Falls back to theme.primary when not set.
   */
  brandColor?: string
  /** Theme color overrides mapped to MJML mj-attributes. */
  theme?: EmailTheme
}

export interface MjmlCompileOptions {
  /** Validation level for the MJML compiler. Defaults to 'soft'. */
  validationLevel?: 'strict' | 'soft' | 'skip'
  beautify?: boolean
  minify?: boolean
  /** Custom web fonts injected by MJML into the head. */
  fonts?: Record<string, string>
  keepComments?: boolean
}

export interface EmailRendererOptions extends ParserOptions, RendererOptions {
  /** Explicit email configuration. Merged over frontmatter.email. */
  email?: EmailConfig
  /** Options forwarded to the MJML compiler. */
  mjmlOptions?: MjmlCompileOptions
  /** Additional CSS injected into <mj-style> in the email head. */
  headCss?: string
}

export interface MjmlCompileError {
  line?: number
  message: string
  tagName?: string
  formattedMessage?: string
}

export interface EmailRenderResult {
  /** Compiled, inline-styled HTML ready to pass to an email service provider. */
  html: string
  /** Subject line extracted from frontmatter.email.subject or options.email.subject. */
  subject?: string
  /** Preview text extracted from frontmatter.email.previewText or options.email.previewText. */
  previewText?: string
  /** MJML validation errors. Empty on success. */
  errors: MjmlCompileError[]
}

/** A node in the MJML JSON tree accepted by mjml2html. */
export interface MjmlNode {
  tagName: string
  attributes: Record<string, string>
  children?: MjmlNode[]
  /** Raw HTML content (for leaf nodes such as mj-text, mj-title, mj-preview). */
  content?: string
}
