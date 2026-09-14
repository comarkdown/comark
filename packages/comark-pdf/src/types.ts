import type { ParserOptions } from 'comark'
import type { JasyComponentFn } from './jasy.ts'

export interface PdfMargin {
  top?: string | number
  right?: string | number
  bottom?: string | number
  left?: string | number
}

/** Page stack alignment along the main axis (jasy `Page` `justify`). */
export type PdfJustify = 'start' | 'center' | 'end' | 'between' | 'around'

/** Page stack alignment across the axis (jasy `Page` `align`). */
export type PdfAlign = 'start' | 'center' | 'end' | 'stretch'

/** Document-level default text alignment (jasy `Document` `align`). */
export type PdfTextAlign = 'left' | 'center' | 'right' | 'justify'

/** Overflow policy when content cannot break across pages (jasy `onOverflow`). */
export type PdfOverflowPolicy = 'error' | 'warn' | 'ignore'

export interface PdfEncryptOptions {
  algorithm?: 'aes-256'
  userPassword: string
  ownerPassword?: string
  permissions?: {
    printing?: boolean
    copying?: boolean
    modifying?: boolean
    annotating?: boolean
  }
}

/**
 * Page / document / render configuration for `@comark/pdf`.
 *
 * Maps onto jasy `Page` props, `Document` text defaults + meta, and a subset of
 * `renderToBytes` options. Set via frontmatter `pdf:` or `options.pdf`.
 */
export interface PdfPageConfig {
  /** Named page format (e.g. 'A4', 'letter', 'A5'). Default: 'A4'. Ignored when `width` and `height` are set. */
  format?: string
  /** Custom page width (e.g. '50mm'). Pair with `height` for non-standard sizes such as product labels. */
  width?: string
  /** Custom page height (e.g. '65mm'). Pair with `width` for non-standard sizes such as product labels. */
  height?: string
  /** Page orientation. Default: 'portrait'. */
  orientation?: 'portrait' | 'landscape'
  /** Page margin as a CSS length string (e.g. '20mm'), points number, or per-side object. */
  margin?: string | number | PdfMargin
  /**
   * Gap between top-level block children, in points (or a CSS length string).
   * Default: 10. Maps to the content `Column` gap (showroom `Page({ gap })`).
   */
  gap?: number | string
  /** Main-axis distribution of page content (e.g. `'center'` for a landscape certificate). */
  justify?: PdfJustify
  /** Cross-axis alignment of page content (e.g. `'center'` for a landscape certificate). */
  align?: PdfAlign

  /** Default font family for text that does not set its own (jasy `Document` `font`). */
  font?: string | string[]
  /** Default font size in points (jasy `Document` `size`). */
  fontSize?: number
  /** Default text color (hex / named). */
  color?: string
  /** Default line-height multiplier (jasy `Document` `lineHeight`). */
  lineHeight?: number
  /** Default text alignment (jasy `Document` `align`). */
  textAlign?: PdfTextAlign
  /** Default bold for inheriting text. */
  bold?: boolean
  /** Default italic for inheriting text. */
  italic?: boolean

  /** PDF document title (metadata + accessibility). */
  title?: string
  /** PDF document author metadata. */
  author?: string
  /** Document language for accessibility, e.g. `'en-US'` / `'de-DE'`. */
  lang?: string
  /** Emit a tagged / accessible PDF structure tree. */
  accessible?: boolean
  /** Policy when unbreakable content overflows a page. Default: `'error'`. */
  onOverflow?: PdfOverflowPolicy
  /** AES-256 password encryption (not compatible with PDF/A / ZUGFeRD). */
  encrypt?: PdfEncryptOptions

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
  /**
   * Embedded TrueType fonts for `renderToBytes` (jasy `RenderOptions.fonts`).
   * Keyed by the name used in `Text({ font })` / `pdf.font`.
   */
  fonts?: Record<string, Uint8Array | {
    normal: Uint8Array
    bold?: Uint8Array
    italic?: Uint8Array
    boldItalic?: Uint8Array
  }>
}
