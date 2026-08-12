import { SyntaxStyle } from '@opentui/core'
import { createContext, useContext } from 'react'

/**
 * Colours and glyphs the renderer paints with. Every field is a plain value so
 * a host application can drive it from its own theme without importing
 * OpenTUI's colour helpers.
 */
export interface MarkdownTheme {
  /** Secondary colour — image placeholders, blockquote body, table rules. */
  muted: string
  /** Heading colour per level, index 0 being `h1`. Deeper levels clamp to the last entry. */
  heading: string[]
  /** Inline `code` chip foreground. */
  codeFg: string
  /** Inline `code` chip background. */
  codeBg: string
  /** Left bar drawn down a blockquote. */
  quoteBorder: string
  /** `hr` rule colour. */
  rule: string
  /** List marker colour (bullet and ordinal). */
  marker: string
  /** Bullet glyph for unordered lists. */
  bullet: string
  /** Table grid colour. */
  tableBorder: string

  /**
   * Colour per GitHub alert kind, keyed by the lowercased `[!NOTE]` label.
   * Unknown kinds fall back to {@link MarkdownTheme.quoteBorder}.
   */
  alert: Record<string, string>
  /**
   * Style table handed to the `CodeRenderable` behind fenced code blocks.
   *
   * Left unset, {@link resolveSyntaxStyle} lazily creates one via
   * `SyntaxStyle.create()` on first paint — by which point a renderer exists.
   * Pass your own to make fenced code follow the host application's theme.
   */
  syntaxStyle?: SyntaxStyle
}

/** Neutral defaults tuned for a dark terminal. */
export const defaultTheme: MarkdownTheme = {
  muted: '#8b949e',
  heading: ['#f0f6fc', '#e6edf3', '#c9d1d9', '#b1bac4', '#8b949e', '#8b949e'],
  codeFg: '#79c0ff',
  codeBg: '#161b22',
  quoteBorder: '#484f58',
  rule: '#30363d',
  marker: '#8b949e',
  bullet: '•',
  tableBorder: '#30363d',
  alert: {
    note: '#58a6ff',
    tip: '#3fb950',
    important: '#a371f7',
    warning: '#d29922',
    caution: '#f85149',
  },
}

const MarkdownThemeContext = createContext<MarkdownTheme>(defaultTheme)

export const MarkdownThemeProvider = MarkdownThemeContext.Provider

export function useMarkdownTheme(): MarkdownTheme {
  return useContext(MarkdownThemeContext)
}

/**
 * Tree-sitter capture styles for the fallback highlighter, in a dark palette.
 *
 * `SyntaxStyle.create()` builds an *empty* table, which resolves every capture to
 * no style and paints code in one flat colour — so a real map is the difference
 * between highlighted and not. Keys are the standard capture names; unmatched
 * captures fall back to `default`.
 */
const DEFAULT_SYNTAX_STYLES: Record<string, { fg?: string; bold?: boolean; italic?: boolean }> = {
  default: { fg: '#c9d1d9' },
  keyword: { fg: '#ff7b72' },
  'keyword.import': { fg: '#ff7b72' },
  'keyword.function': { fg: '#ff7b72' },
  'keyword.return': { fg: '#ff7b72' },
  'keyword.operator': { fg: '#ff7b72' },
  string: { fg: '#a5d6ff' },
  'string.escape': { fg: '#79c0ff' },
  'string.special': { fg: '#a5d6ff' },
  character: { fg: '#a5d6ff' },
  comment: { fg: '#8b949e', italic: true },
  number: { fg: '#79c0ff' },
  boolean: { fg: '#79c0ff' },
  constant: { fg: '#79c0ff' },
  'constant.builtin': { fg: '#79c0ff' },
  function: { fg: '#d2a8ff' },
  'function.call': { fg: '#d2a8ff' },
  'function.method': { fg: '#d2a8ff' },
  'function.builtin': { fg: '#d2a8ff' },
  type: { fg: '#ffa657' },
  'type.builtin': { fg: '#ffa657' },
  constructor: { fg: '#ffa657' },
  variable: { fg: '#c9d1d9' },
  'variable.parameter': { fg: '#ffa657' },
  'variable.builtin': { fg: '#ffa657' },
  property: { fg: '#79c0ff' },
  label: { fg: '#79c0ff' },
  operator: { fg: '#ff7b72' },
  punctuation: { fg: '#8b949e' },
  'punctuation.bracket': { fg: '#8b949e' },
  'punctuation.delimiter': { fg: '#8b949e' },
  'punctuation.special': { fg: '#8b949e' },
  tag: { fg: '#7ee787' },
  'tag.attribute': { fg: '#79c0ff' },
  attribute: { fg: '#79c0ff' },
}

/**
 * Lazily created stand-in for a caller-supplied `syntaxStyle`.
 *
 * `CodeOptions.syntaxStyle` is required and `SyntaxStyle.fromStyles` reaches into
 * the native render lib, so it cannot run at module load — only once a renderer
 * is up. Cached because every fenced code block would otherwise allocate one.
 */
let fallbackSyntaxStyle: SyntaxStyle | undefined

export function resolveSyntaxStyle(theme: MarkdownTheme): SyntaxStyle {
  if (theme.syntaxStyle) {
    return theme.syntaxStyle
  }

  fallbackSyntaxStyle ??= SyntaxStyle.fromStyles(DEFAULT_SYNTAX_STYLES)

  return fallbackSyntaxStyle
}
