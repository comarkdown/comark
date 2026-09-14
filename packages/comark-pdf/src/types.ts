import type { ParserOptions } from 'comark'
import type { JasyComponentFn } from './jasy.ts'

export interface PdfMargin {
  top?: string
  right?: string
  bottom?: string
  left?: string
}

export interface PdfPageConfig {
  /** Named page format (e.g. 'A4', 'letter'). Default: 'A4'. */
  format?: string
  /** Page orientation. Default: 'portrait'. */
  orientation?: 'portrait' | 'landscape'
  /** Page margin as a CSS length string (e.g. '20mm') or per-side object. */
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

export interface PdfRendererOptions extends ParserOptions {
  /** Explicit PDF page configuration. Merged over frontmatter.pdf. */
  pdf?: PdfPageConfig
  /** Custom jasy component renderers, keyed by Comark component tag name. */
  components?: Record<string, JasyComponentFn>
}
