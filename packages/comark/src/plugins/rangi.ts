import type { ElementNode, Node, MarkdownDocument } from 'comark'
import type { ShjLanguage, ShjLanguages, ShjTheme, ShjThemePair, ShjToken, ShjTokenized } from 'rangi'
import { tokenize } from 'rangi'
import { dark as defaultDark, defaultTheme } from 'rangi/themes'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { visitAsync } from '../utils/index.ts'
import comarkLanguage from '../utils/comark.rangiLanguage.ts'

/**
 * Languages accepted by the plugin.
 *
 * Extends the closed {@link ShjLanguage} union from `rangi` with an open string
 * branch so custom languages passed via `languages` type-check.
 */
export type RangiLanguage = ShjLanguage | (string & {})

/**
 * The Comark grammar, under every name a Comark fence may be written with.
 *
 * `md` and `markdown` are included on purpose: Comark is a superset of
 * Markdown, so highlighting a plain markdown fence with it is strictly more
 * information — and it mirrors the `md`/`markdown`/`comark` → `mdc` aliases the
 * Shiki plugin registers. Pass your own `languages: { md: … }` to override.
 */
export const comarkLanguages: ShjLanguages = {
  comark: comarkLanguage,
  mdc: comarkLanguage,
  md: comarkLanguage,
  markdown: comarkLanguage,
}

/**
 * Token types emitted by rangi.
 * Rendered with inline colors (and optional `shj-*` / `shj-syn-*` classes).
 */
export type RangiToken = ShjToken

/** Re-export theme types for consumers. */
export type { ShjTheme as RangiTheme, ShjThemePair as RangiThemePair, ShjToken }

export interface RangiOptions {
  /**
   * Theme(s) for inline colors.
   *
   * - A single {@link ShjTheme}
   * - A `{ light, dark }` pair — also emits `--shiki-dark*` vars for class-based
   *   dark-mode toggles
   *
   * Defaults to rangi's built-in light/dark pair when omitted.
   */
  theme?: ShjTheme | ShjThemePair

  /**
   * Whether to wrap each source line in `<span class="line">`.
   * Lines are also wrapped automatically when fence highlights (`{1,3-5}`)
   * are present.
   * @default false
   */
  lineNumbers?: boolean

  /**
   * Class prefix for the highlighted `<pre>` element.
   * Final class is `${classPrefix} shiki shj-lang-${lang}`.
   * @default 'shj'
   */
  classPrefix?: string

  /**
   * Extra custom language grammars passed through to `tokenize`.
   *
   * Merged over {@link comarkLanguages}, so `{ md: myGrammar }` restores
   * rangi's own markdown grammar for `md` fences.
   *
   * @see https://github.com/pi0/rangi#tokenizer
   */
  languages?: Record<string, unknown>

  /**
   * Whether to add background/foreground styles to `<pre>` elements.
   * @default false
   */
  preStyles?: boolean
}

export interface CodeBlockAttributes {
  language?: string
  class?: string
  highlights?: number[]
  meta?: string
  filename?: string
}

/**
 * Resolve a fence language string for rangi.
 *
 * Missing/empty fence info → `plain`. Everything else is passed through —
 * rangi already knows common aliases (`javascript`, `typescript`, `python`, …)
 * and falls back to plain text for unknowns.
 */
export function resolveRangiLanguage(language: string | undefined): RangiLanguage {
  if (!language) return 'plain'
  const raw = language.trim().toLowerCase()
  return raw || 'plain'
}

/**
 * Merge the Comark grammars with any custom ones, custom winning.
 */
function resolveLanguages(languages?: Record<string, unknown>): ShjLanguages {
  return languages ? { ...comarkLanguages, ...(languages as ShjLanguages) } : comarkLanguages
}

/**
 * Tokenize source using `rangi`.
 *
 * {@link comarkLanguages} is always registered, so `comark`, `mdc`, `md` and
 * `markdown` fences are highlighted with the Comark grammar.
 */
export function tokenizeCode(
  code: string,
  language: RangiLanguage,
  languages?: Record<string, unknown>
): ShjTokenized[] {
  return tokenize(code, {
    lang: language,
    languages: resolveLanguages(languages),
  })
}

function isThemePair(theme: ShjTheme | ShjThemePair): theme is ShjThemePair {
  return !!(theme as ShjThemePair).light && !!(theme as ShjThemePair).dark
}

function tokenColor(theme: ShjTheme | undefined, type: string | undefined): string | undefined {
  if (!theme || !type) return undefined
  return theme.tokens?.[type as ShjToken] || theme.fg
}

/**
 * Build inline style for a token, dual-theme aware.
 */
function tokenStyle(
  type: string | undefined,
  light: ShjTheme | undefined,
  dark: ShjTheme | undefined,
  dual: boolean
): string | undefined {
  if (!type || (!light && !dark)) return undefined
  const lightColor = tokenColor(light, type)
  const darkColor = tokenColor(dark, type)
  const styles: string[] = []
  if (lightColor) styles.push(`color:${lightColor}`)
  if (dual && darkColor) styles.push(`--shiki-dark:${darkColor}`)
  // Single dark-only theme
  if (!light && darkColor) styles.push(`color:${darkColor}`)
  return styles.length ? styles.join(';') : undefined
}

/**
 * Group a flat token stream into line-aligned Node arrays.
 * Newline characters may appear inside a token; they are split so each line
 * can be wrapped independently (and receive `.highlight`).
 */
function tokensToLines(
  tokens: ShjTokenized[],
  opts: {
    light?: ShjTheme
    dark?: ShjTheme
    dual: boolean
  }
): Node[][] {
  const lines: Node[][] = [[]]

  const pushToken = (text: string, type?: string): void => {
    if (!text) return
    const line = lines[lines.length - 1]

    if (!type) {
      const last = line[line.length - 1]
      if (typeof last === 'string') {
        line[line.length - 1] = last + text
      } else {
        line.push(text)
      }
      return
    }

    const attrs: Record<string, string> = {
      // `shj-*` matches rangi docs; `shj-syn-*` stays compatible with older stylesheets
      class: `shj-syn-${type} shj-${type}`,
    }

    const style = tokenStyle(type, opts.light, opts.dark, opts.dual)
    if (style) attrs.style = style

    line.push(['span', attrs, text])
  }

  for (const token of tokens) {
    const parts = token.text.split('\n')
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) lines.push([])
      pushToken(parts[i], token.type)
    }
  }

  return lines
}

/**
 * Build code children from tokenized lines.
 */
function buildCodeChildren(lines: Node[][], highlights: number[] | undefined, wrapLines: boolean): Node[] {
  const highlightSet = Array.isArray(highlights) && highlights.length > 0 ? new Set(highlights) : null
  const children: Node[] = []

  for (let i = 0; i < lines.length; i++) {
    const lineNodes = lines[i]
    const lineNumber = i + 1
    const isHighlighted = highlightSet !== null && highlightSet.has(lineNumber)

    if (wrapLines) {
      const className = isHighlighted ? 'line highlight' : 'line'
      // eslint-disable-next-line unicorn/no-new-array -- pre-allocated for perf
      const lineEl = new Array(lineNodes.length + 2) as ElementNode
      lineEl[0] = 'span'
      lineEl[1] = {
        class: className,
        style: isHighlighted ? 'display: inline-block' : 'display: inline',
      }
      for (let j = 0; j < lineNodes.length; j++) lineEl[j + 2] = lineNodes[j]
      children.push(lineEl)
    } else if (lineNodes.length === 0) {
      // empty
    } else if (lineNodes.length === 1) {
      children.push(lineNodes[0])
    } else {
      children.push(...lineNodes)
    }

    if (i < lines.length - 1) children.push('\n')
  }

  return children
}

function buildPreStyle(light?: ShjTheme, dark?: ShjTheme, dual?: boolean): string | undefined {
  if (!light && !dark) return undefined
  const styles: string[] = []
  const primary = light || dark!
  if (primary.bg) styles.push(`background-color:${primary.bg}`)
  if (primary.fg) styles.push(`color:${primary.fg}`)
  if (dual && dark) {
    if (dark.bg) styles.push(`--shiki-dark-bg:${dark.bg}`)
    if (dark.fg) styles.push(`--shiki-dark:${dark.fg}`)
  }
  return styles.length ? styles.join(';') : undefined
}

/**
 * Apply rangi syntax highlighting to every `<pre><code>` block.
 */
export async function rangiCodeBlocks(tree: MarkdownDocument, options: RangiOptions = {}): Promise<MarkdownDocument> {
  const { lineNumbers = false, classPrefix = 'shj', languages, theme, preStyles = false } = options

  let light: ShjTheme
  let dark: ShjTheme
  let dual = false

  const resolved = theme || { light: defaultTheme, dark: defaultDark }
  if (isThemePair(resolved)) {
    light = resolved.light
    dark = resolved.dark
    dual = light.name !== dark.name
  } else if (resolved.scheme === 'dark') {
    dark = resolved
    light = resolved
  } else {
    light = resolved
    dark = resolved
  }

  await visitAsync(
    tree,
    (node) =>
      Array.isArray(node) &&
      node[0] === 'pre' &&
      Array.isArray(node[2]) &&
      node[2][0] === 'code' &&
      typeof node[2][2] === 'string',
    async (node) => {
      const pre = node as ElementNode
      const attrs = (pre[1] || {}) as CodeBlockAttributes
      const codeEl = pre[2] as ElementNode
      const code = codeEl[2] as string
      const lang = resolveRangiLanguage(attrs.language)

      let codeChildren: Node[]
      try {
        const tokens = tokenizeCode(code, lang, languages)
        const lines = tokensToLines(tokens, { light, dark, dual })
        const hasHighlights = Array.isArray(attrs.highlights) && attrs.highlights.length > 0
        codeChildren = buildCodeChildren(lines, attrs.highlights, lineNumbers || hasHighlights)
      } catch {
        codeChildren = [code]
      }

      const userClass = typeof attrs.class === 'string' ? attrs.class.trim() : ''
      // `shiki` so dual-theme CSS hooks shared with the Shiki plugin work
      const highlighterClass = `${classPrefix} shiki shj-lang-${lang}`
      const classStr = userClass ? `${highlighterClass} . ${userClass}` : highlighterClass

      const newPreAttrs: Record<string, unknown> = { ...attrs, class: classStr }
      if (preStyles) {
        const style = buildPreStyle(light, dark, dual)
        if (style) newPreAttrs.style = style
      }

      // eslint-disable-next-line unicorn/no-new-array -- pre-allocated for perf
      const newCode = new Array(codeChildren.length + 2) as ElementNode
      newCode[0] = 'code'
      newCode[1] = (codeEl[1] as Record<string, unknown>) || {}
      for (let i = 0; i < codeChildren.length; i++) newCode[i + 2] = codeChildren[i]

      return ['pre', newPreAttrs, newCode] as ElementNode
    }
  )

  return tree
}

export default defineComarkPlugin<RangiOptions>((options: RangiOptions = {}) => ({
  name: 'rangi',
  async post(state) {
    state.tree = await rangiCodeBlocks(state.tree, options)
  },
}))
