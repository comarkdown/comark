import type { ElementNode, Node, MarkdownDocument } from 'comark'
import type { ShjLanguage, ShjToken } from '@speed-highlight/core'
import { tokenize } from '@speed-highlight/core'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { visitAsync } from '../utils/index.ts'

/**
 * Languages accepted by the plugin.
 *
 * Extends the closed {@link ShjLanguage} union from `@speed-highlight/core` with
 * an open string branch so custom languages registered via `loadLanguage`
 * (or values from `langAlias`) type-check.
 */
export type SpeedHighlightLanguage = ShjLanguage | (string & {})

/**
 * Token types emitted by speed-highlight.
 * Rendered as `shj-syn-<type>` CSS classes.
 */
export type SpeedHighlightToken = ShjToken | (string & {})

export interface SpeedHighlightOptions {
  /**
   * Map fence language info strings to speed-highlight language ids.
   * Merged on top of the built-in aliases.
   *
   * @example
   * ```ts
   * speedHighlight({
   *   langAlias: { vue: 'html', shell: 'bash' }
   * })
   * ```
   */
  langAlias?: Record<string, SpeedHighlightLanguage>

  /**
   * Whether to wrap each source line in `<span class="line">`.
   * Required for `{1,3-5}` line-highlight support.
   * @default true
   */
  lineNumbers?: boolean

  /**
   * Class prefix for the highlighted `<pre>` element.
   * Final class is `${classPrefix} shj-lang-${lang}`.
   * @default 'shj'
   */
  classPrefix?: string
}

export interface CodeBlockAttributes {
  language?: string
  class?: string
  highlights?: number[]
  meta?: string
  filename?: string
}

/**
 * Built-in aliases from common markdown fence names → speed-highlight ids.
 */
const DEFAULT_LANG_ALIAS: Record<string, SpeedHighlightLanguage> = {
  // JavaScript family
  javascript: 'js',
  jsx: 'js',
  mjs: 'js',
  cjs: 'js',
  // TypeScript family
  typescript: 'ts',
  tsx: 'ts',
  mts: 'ts',
  cts: 'ts',
  // Python
  python: 'py',
  // Rust
  rust: 'rs',
  // Shell
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  // Perl
  perl: 'pl',
  // Makefile
  makefile: 'make',
  // Markdown
  markdown: 'md',
  mdc: 'md',
  comark: 'md',
  // YAML
  yml: 'yaml',
  // Plain text
  text: 'plain',
  txt: 'plain',
  plaintext: 'plain',
  // HTML-ish
  svg: 'xml',
  // JSON render fences stay json
  'json-render': 'json',
  'yaml-render': 'yaml',
}

/**
 * Resolve a fence language string to a speed-highlight language id.
 *
 * Applies built-in + user aliases, then hands the id straight to
 * `@speed-highlight/core`. Missing/empty fence info → `plain`. Unknown ids
 * are fine — tokenize falls back to unstyled plain text rather than throwing.
 */
export function resolveSpeedHighlightLanguage(
  language: string | undefined,
  options: Pick<SpeedHighlightOptions, 'langAlias'> = {}
): SpeedHighlightLanguage {
  if (!language) return 'plain'

  const raw = language.trim().toLowerCase()
  if (!raw) return 'plain'

  const alias = { ...DEFAULT_LANG_ALIAS, ...options.langAlias }
  return alias[raw] || raw
}

/**
 * Tokenize source into plain text / typed spans using `@speed-highlight/core`.
 */
export async function tokenizeCode(
  code: string,
  language: SpeedHighlightLanguage
): Promise<Array<{ text: string; type?: SpeedHighlightToken }>> {
  const tokens: Array<{ text: string; type?: SpeedHighlightToken }> = []

  // `SpeedHighlightLanguage` is wider than `ShjLanguage` (open string for custom
  // langs via loadLanguage / langAlias). Cast at the library boundary.
  await tokenize(code, language as ShjLanguage, (text, type) => {
    if (!text) return
    tokens.push(type ? { text, type } : { text })
  })

  return tokens
}

/**
 * Group a flat token stream into line-aligned Node arrays.
 * Newline characters may appear inside a token; they are split so each line
 * can be wrapped independently (and receive `.highlight`).
 */
function tokensToLines(tokens: Array<{ text: string; type?: string }>): Node[][] {
  const lines: Node[][] = [[]]

  const pushToken = (text: string, type?: string): void => {
    if (!text) return
    const line = lines[lines.length - 1]
    if (type) {
      line.push(['span', { class: `shj-syn-${type}` }, text])
    } else {
      // Merge adjacent plain-text nodes to keep the AST compact
      const last = line[line.length - 1]
      if (typeof last === 'string') {
        line[line.length - 1] = last + text
      } else {
        line.push(text)
      }
    }
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
        // Match shiki highlight plugin defaults so shared CSS works
        style: isHighlighted ? 'display: inline-block' : 'display: inline',
      }
      for (let j = 0; j < lineNodes.length; j++) lineEl[j + 2] = lineNodes[j]
      children.push(lineEl)
    } else if (lineNodes.length === 0) {
      // empty line — nothing to push
    } else if (lineNodes.length === 1) {
      children.push(lineNodes[0])
    } else {
      children.push(...lineNodes)
    }

    if (i < lines.length - 1) children.push('\n')
  }

  return children
}

/**
 * Apply speed-highlight syntax highlighting to every `<pre><code>` block.
 */
export async function speedHighlightCodeBlocks(
  tree: MarkdownDocument,
  options: SpeedHighlightOptions = {}
): Promise<MarkdownDocument> {
  const { langAlias, lineNumbers = true, classPrefix = 'shj' } = options

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
      const lang = resolveSpeedHighlightLanguage(attrs.language, { langAlias })

      let codeChildren: Node[]
      try {
        const tokens = await tokenizeCode(code, lang)
        const lines = tokensToLines(tokens)
        codeChildren = buildCodeChildren(lines, attrs.highlights, lineNumbers)
      } catch {
        // Fail open: leave the code unhighlighted rather than crashing parse
        codeChildren = [code]
      }

      const userClass = typeof attrs.class === 'string' ? attrs.class.trim() : ''
      // Mirror shiki's `.` separator so stringify can recover user classes
      const highlighterClass = `${classPrefix} shj-lang-${lang}`
      const classStr = userClass ? `${highlighterClass} . ${userClass}` : highlighterClass

      // eslint-disable-next-line unicorn/no-new-array -- pre-allocated for perf
      const newCode = new Array(codeChildren.length + 2) as ElementNode
      newCode[0] = 'code'
      newCode[1] = (codeEl[1] as Record<string, unknown>) || {}
      for (let i = 0; i < codeChildren.length; i++) newCode[i + 2] = codeChildren[i]

      return ['pre', { ...attrs, class: classStr }, newCode] as ElementNode
    }
  )

  return tree
}

export default defineComarkPlugin<SpeedHighlightOptions>((options: SpeedHighlightOptions = {}) => ({
  name: 'speed-highlight',
  async post(state) {
    state.tree = await speedHighlightCodeBlocks(state.tree, options)
  },
}))
