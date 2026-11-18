import type { ElementNode, ElementNodeAttributes, MarkdownDocument, Node } from 'comark'
import type { Theme, ThemedToken, TokensResult } from '@pierre/highlights'
import { codeToTokens, isSupportedLanguage } from '@pierre/highlights'
import defaultLight from '@pierre/highlights/themes/material-theme-lighter'
import defaultDark from '@pierre/highlights/themes/material-theme-palenight'
import { defineComarkPlugin } from 'comark'
import { TREE_WALK_MAX_DEPTH } from 'comark/utils'
import { GRAMMAR_CONTEXTS, inlineCodeLanguage } from '../internal/inline-code-lang.ts'

export type { Theme as PierreHighlightsTheme } from '@pierre/highlights'

export interface PierreHighlightsOptions {
  /**
   * Themes from `@pierre/highlights/themes`. With two different themes, the
   * light one is inlined as `color` and the dark one is emitted as
   * `--shiki-dark*` variables, the same as the Shiki plugin.
   *
   * Defaults to Material Theme Lighter and Material Theme Palenight, the Shiki
   * plugin's defaults.
   */
  themes?: {
    light?: Theme
    dark?: Theme
  }

  /**
   * Whether to add the theme's background and foreground colors to `<pre>`.
   * @default false
   */
  preStyles?: boolean

  /**
   * Whether to highlight inline code that declares a language, e.g.
   * `` `Ref<T>`{lang="ts-type"} ``. `lang` wins over `language`. `preStyles`
   * does not apply to inline code.
   *
   * @default true
   */
  inlineCode?: boolean
}

export interface CodeBlockAttributes {
  language?: string
  class?: string
  highlights?: number[]
  meta?: string
}

const CLASS = 'shiki pierre-highlights'

/** Fence names Highlights does not know itself, mapped like the Shiki plugin maps them. */
const LANGUAGE_ALIASES: Record<string, string> = {
  comark: 'mdc',
  'json-render': 'json',
  'yaml-render': 'yaml',
}

/**
 * Map a fence or inline language to a Highlights language, or `undefined`
 * when Highlights has no lexer for it. A missing language is plain text.
 */
export function resolvePierreHighlightsLanguage(language: unknown): string | undefined {
  // Attributes from a `::pre{language=…}` wrapper can be any JSON value.
  const raw = typeof language === 'string' ? language.trim().toLowerCase() : ''
  if (!raw) return 'text'
  const lang = LANGUAGE_ALIASES[raw] ?? raw
  // `ansi` tokens drop the escape sequences, which would then be lost when
  // the document is written back to Markdown.
  return lang !== 'ansi' && isSupportedLanguage(lang) ? lang : undefined
}

function tokenStyle(token: ThemedToken): string {
  let style = ''
  const styles = token.htmlStyle!
  for (const key in styles) style += `${style ? ';' : ''}${key}:${styles[key]}`
  return style
}

/** Append one span per token. A loop, not a spread: a long line can exceed the argument limit. */
function appendSpans(target: ElementNode, line: ThemedToken[]): void {
  for (const token of line) {
    const style = tokenStyle(token)
    target.push(style ? ['span', { style }, token.content] : ['span', {}, token.content])
  }
}

/** Drop the first `length` characters of a line, splitting the token they end in. */
function dropPrefix(line: ThemedToken[], length: number): ThemedToken[] {
  const out: ThemedToken[] = []
  let remain = length
  for (const token of line) {
    if (remain >= token.content.length) {
      remain -= token.content.length
      continue
    }
    out.push(remain > 0 ? { ...token, content: token.content.slice(remain) } : token)
    remain = 0
  }
  return out
}

function withUserClass(highlighterClass: string, userClass: unknown): string {
  const user = typeof userClass === 'string' ? userClass.trim() : ''
  return user ? `${highlighterClass} . ${user}` : highlighterClass
}

/**
 * Apply `@pierre/highlights` syntax highlighting to every `<pre><code>` block
 * and, when enabled, to inline `<code>` that declares a language.
 */
export function pierreHighlightsCodeBlocks(
  tree: MarkdownDocument,
  options: PierreHighlightsOptions = {}
): MarkdownDocument {
  return createHighlighter(options)(tree)
}

function createHighlighter(options: PierreHighlightsOptions): (tree: MarkdownDocument) => MarkdownDocument {
  // The streaming parser hands the same raw node to every update while its
  // source is unchanged, so tokens are cached by raw node and reused only when
  // its code and language still match. Output nodes are rebuilt every time:
  // callers and later plugins may edit them in place.
  const cache = new WeakMap<ElementNode, { source: string; lang: string; result: TokensResult }>()
  const light = options.themes?.light ?? options.themes?.dark ?? defaultLight
  const dark = options.themes?.dark ?? options.themes?.light ?? defaultDark
  const themes: Record<string, Theme> = light === dark ? { light } : { light, dark }
  const inlineEnabled = options.inlineCode !== false

  const tokenize = (el: ElementNode, source: string, lang: string): TokensResult => {
    const cached = cache.get(el)
    if (cached?.source === source && cached.lang === lang) return cached.result
    const result = codeToTokens(source, { lang: lang as any, themes, cssVariablePrefix: '--shiki-' })
    cache.set(el, { source, lang, result })
    return result
  }

  const isBlock = (node: ElementNode): boolean => {
    const code = node[2]
    return (
      node[0] === 'pre' &&
      node.length === 3 &&
      Array.isArray(code) &&
      code[0] === 'code' &&
      code.length === 3 &&
      typeof code[2] === 'string'
    )
  }

  // A raw-HTML `<code lang="ts">` is authored markup, not Comark inline
  // code, and replacing it with spans would break its round-trip.
  const isInline = (node: ElementNode): boolean =>
    inlineEnabled &&
    node[0] === 'code' &&
    node.length === 3 &&
    typeof node[2] === 'string' &&
    node[1]?.$?.html !== 1 &&
    !!inlineCodeLanguage(node[1])

  // Copy only the path to each replaced node: the streaming parser caches and
  // reuses the input nodes, so they must stay unhighlighted.
  // Deeper subtrees are left unhighlighted rather than overflowing the stack.
  const walk = (node: Node, depth: number): Node => {
    if (!Array.isArray(node) || node[0] === null) return node
    const el = node as ElementNode
    if (isBlock(el)) return highlightBlock(el)
    if (isInline(el)) return highlightInline(el) ?? el
    if (depth >= TREE_WALK_MAX_DEPTH) return el
    let copy: ElementNode | undefined
    for (let i = 2; i < el.length; i++) {
      const child = el[i] as Node
      const next = walk(child, depth + 1)
      if (next !== child) {
        copy ??= el.slice() as ElementNode
        copy[i] = next
      }
    }
    return copy ?? el
  }

  function highlightBlock(pre: ElementNode): ElementNode {
    const attrs = pre[1] as CodeBlockAttributes & Record<string, unknown>
    const codeEl = pre[2] as ElementNode
    const code = codeEl[2] as string
    const lang = resolvePierreHighlightsLanguage(attrs.language)
    const preAttrs: Record<string, unknown> = { ...attrs, class: withUserClass(CLASS, attrs.class) }

    // A `<pre>` is unambiguously code, so an unknown language still gets the
    // highlighter class, with the code left as plain text.
    if (!lang) return ['pre', preAttrs, ['code', codeEl[1], code]]

    const result = tokenize(pre, code, lang)
    if (options.preStyles) preAttrs.style = `background-color:${result.bg};color:${result.fg}`

    const highlights = Array.isArray(attrs.highlights) && attrs.highlights.length > 0 ? new Set(attrs.highlights) : null
    const lines = result.tokens
    // eslint-disable-next-line unicorn/no-new-array -- pre-allocated for perf
    const codeNode = new Array(2) as ElementNode
    codeNode[0] = 'code'
    codeNode[1] = codeEl[1]
    for (let i = 0; i < lines.length; i++) {
      const highlighted = highlights !== null && highlights.has(i + 1)
      // TODO: (enforcing default style) once we unify all ecosystem styles we can remove `style`
      const line: ElementNode = [
        'span',
        highlighted
          ? { class: 'line highlight', style: 'display: inline-block' }
          : { class: 'line', style: 'display: inline' },
      ]
      appendSpans(line, lines[i])
      codeNode.push(line)
      if (i < lines.length - 1) codeNode.push('\n')
    }
    return ['pre', preAttrs, codeNode]
  }

  function highlightInline(el: ElementNode): ElementNode | undefined {
    const attrs = el[1] as ElementNodeAttributes
    const code = el[2] as string
    const written = inlineCodeLanguage(attrs) as string
    // Fragment names are matched case-insensitively, same as fence languages.
    const context = GRAMMAR_CONTEXTS.get(written.toLowerCase())
    const lang = resolvePierreHighlightsLanguage(context?.lang ?? written)

    // Unlike a `<pre>`, an inline `<code>` is not unambiguously code, since
    // `lang` is a real HTML attribute for natural language. Leave
    // `` `Bonjour`{lang="fr"} `` exactly as it was authored.
    if (!lang) return undefined

    // Highlights has no grammar-context option: tokenize the seed with the
    // code, then drop the seed's characters from the first line.
    const prefix = context?.grammarContextCode ?? ''
    // Copied: the token arrays may be cached for the next update.
    const lines = tokenize(el, prefix + code, lang).tokens.slice()
    if (prefix && lines.length > 0) lines[0] = dropPrefix(lines[0], prefix.length)

    const inlineNode: ElementNode = ['code', { ...attrs, class: withUserClass(CLASS, attrs.class) }]
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) inlineNode.push('\n')
      appendSpans(inlineNode, lines[i])
    }
    if (inlineNode.length === 2) inlineNode.push(code)
    return inlineNode
  }

  return (tree) => {
    let nodes: Node[] | undefined
    for (let i = 0; i < tree.nodes.length; i++) {
      const next = walk(tree.nodes[i], 0)
      if (next !== tree.nodes[i]) {
        nodes ??= tree.nodes.slice()
        nodes[i] = next
      }
    }
    return nodes ? { ...tree, nodes } : tree
  }
}

export default defineComarkPlugin<PierreHighlightsOptions>((options: PierreHighlightsOptions = {}) => {
  const highlight = createHighlighter(options)
  return {
    name: 'pierre-highlights',
    post(state) {
      state.tree = highlight(state.tree)
    },
  }
})
