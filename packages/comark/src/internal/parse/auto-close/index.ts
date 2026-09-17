/**
 * Auto-closes unclosed markdown and Comark component syntax.
 *
 * O(n) character scanning. Two layers:
 *   - Block: full-document scan (fences, components, frontmatter, tables, `$$`)
 *   - Inline: last content line only (emphasis, links, math, HTML, tildes)
 * Behavioral contract: `packages/comark/SPEC/auto-close.md`.
 */

import { closeTables } from './table.ts'

export const INCOMPLETE_LINK_PLACEHOLDER = 'comark:incomplete-link'
export const INCOMPLETE_IMAGE_PLACEHOLDER = 'comark:incomplete-image'

export type LinkMode = 'protocol' | 'text-only'

export interface AutoCloseOptions {
  frontmatter?: boolean
  /** Component fences (`::`). Default true. */
  syntax?: boolean
  /** Attached `{...}` attribute scopes. Defaults to `syntax`. */
  attributes?: boolean
  linkMode?: LinkMode
  incompleteLinkPlaceholder?: string
  incompleteImagePlaceholder?: string
  /**
   * Auto-close math. When set, enables both block and inline unless the more
   * specific flags override. Enabled automatically when the math plugin is used
   * in `parseMarkdown`.
   * Prefer `blockMath` / `inlineMath` for independent control.
   */
  math?: boolean
  /** Auto-close block `$$…$$`. Defaults to `math` (else false). */
  blockMath?: boolean
  /** Auto-close inline `$…$`. Defaults to `math` (else false). Off by default so `$50` stays prose. */
  inlineMath?: boolean
  /**
   * Drop a trailing opener (`* _ $ : [ { !`) after whitespace at EOF so a
   * half-typed marker does not flash (`hello *` → `hello`). Default false.
   * Enabled automatically when `parseMarkdown(..., { streaming: true })`.
   */
  dropTrailingOpeners?: boolean
  /** Auto-close incomplete links (`[text`). Default true. */
  links?: boolean
  /** Auto-close incomplete images (`![alt`). Default true. */
  images?: boolean
  /** Auto-close `**bold**`. Default true. */
  bold?: boolean
  /** Auto-close `*italic*` / `_italic_`. Default true. */
  italic?: boolean
  /** Auto-close `~~strikethrough~~`. Default true. */
  strikethrough?: boolean
  /** Auto-close inline `` `code` ``. Default true. */
  inlineCode?: boolean
  /** Auto-close `***bold-italic***`. Default true. */
  boldItalic?: boolean
  /** Escape mid-word single `~` (`20~25` → `20\~25`). Default true. */
  singleTilde?: boolean
  /**
   * Escape list-item comparison openers (`- > 25` → `- \> 25`) so they are not
   * parsed as blockquotes. Default true.
   */
  comparisonOperators?: boolean
  /** Strip incomplete HTML tags at EOF (`Hello <div` → `Hello`). Default true. */
  htmlTags?: boolean
  /** Complete incomplete GFM tables (header delimiter row). Default true. */
  tables?: boolean
}

export function autoCloseMarkdown(markdown: string, options: AutoCloseOptions = {}): string {
  if (!markdown) return markdown

  const syntaxEnabled = options.syntax !== false
  const attributesEnabled = options.attributes ?? syntaxEnabled
  const linkMode: LinkMode = options.linkMode ?? 'protocol'
  const linkPh = options.incompleteLinkPlaceholder ?? INCOMPLETE_LINK_PLACEHOLDER
  const imagePh = options.incompleteImagePlaceholder ?? INCOMPLETE_IMAGE_PLACEHOLDER
  // Math: prefer explicit block/inline flags; `math: true` turns both on for back-compat.
  const mathLegacy = options.math === true
  const blockMath = options.blockMath ?? mathLegacy
  const inlineMath = options.inlineMath ?? mathLegacy
  const tablesEnabled = options.tables !== false
  const healOpts: HealOpts = {
    attributesEnabled,
    linkMode,
    linkPh,
    imagePh,
    blockMath,
    inlineMath,
    links: options.links !== false,
    images: options.images !== false,
    bold: options.bold !== false,
    italic: options.italic !== false,
    strikethrough: options.strikethrough !== false,
    inlineCode: options.inlineCode !== false,
    boldItalic: options.boldItalic !== false,
    singleTilde: options.singleTilde !== false,
    comparisonOperators: options.comparisonOperators !== false,
    htmlTags: options.htmlTags !== false,
  }

  if (options.dropTrailingOpeners === true) markdown = dropTrailingOpeners(markdown)

  // --- Block pass: full document (fences, components, frontmatter, tables, block math) ---
  const lines = markdown.split('\n')
  const n = lines.length

  let inFrontmatter = false
  let frontmatterHasContent = false
  let tableStart = -1
  let inRawTextElement: 'style' | 'script' | 'pre' | 'textarea' | null = null
  let fenceOpen = false
  /** Length of the opening fence run while `fenceOpen` (CommonMark matching). */
  let fenceOpenLen = 0
  let inBlockMath = false

  const componentStack: Array<{ depth: number; name: string; indent: string; hasYamlProps: boolean }> = []

  for (let idx = 0; idx < n; idx++) {
    const line = lines[idx]
    const trimmed = line.trim()

    if (inRawTextElement) {
      if (RAW_TEXT_CLOSE_RE[inRawTextElement].test(line)) inRawTextElement = null
      continue
    }
    const rawMatch = RAW_TEXT_OPEN_RE.exec(trimmed)
    if (rawMatch) {
      const tag = rawMatch[1].toLowerCase() as 'style' | 'script' | 'pre' | 'textarea'
      if (!RAW_TEXT_CLOSE_RE[tag].test(line)) inRawTextElement = tag
      continue
    }

    if (isFenceLine(line)) {
      // Single-line incomplete fence ```...`` is NOT a multi-line fence open
      // (SPEC closes the third backtick instead of treating the rest as code).
      const t = line.trim()
      if (t.startsWith('```') && t.endsWith('``') && !t.endsWith('```') && !t.slice(3).includes('```')) {
        // leave fenceOpen alone; heal pass will complete the trailing `
        continue
      }
      // Count fence marker length (after indent)
      let fi = 0
      while (fi < line.length && (line[fi] === ' ' || line[fi] === '\t')) fi++
      const fch = line[fi]
      let fn = 0
      while (fi + fn < line.length && line[fi + fn] === fch) fn++
      if (!fenceOpen) {
        fenceOpen = true
        fenceOpenLen = fn
      } else if (fn >= fenceOpenLen) {
        // Closer must be ≥ opener length (CommonMark). Shorter (`open ```` + close ```) keeps fence open.
        fenceOpen = false
        fenceOpenLen = 0
      }
      continue
    }
    if (fenceOpen) continue

    // Standalone $$ toggles a block-math region (closed after the pass when blockMath is on)
    if (blockMath && trimmed === '$$') {
      inBlockMath = !inBlockMath
      continue
    }

    if (idx === 0 && options.frontmatter && trimmed === '---') {
      inFrontmatter = true
      continue
    }
    if (inFrontmatter) {
      if (trimmed === '---') inFrontmatter = false
      else if (trimmed) frontmatterHasContent = true
      continue
    }

    if (trimmed === '---' && componentStack.length > 0) {
      const top = componentStack[componentStack.length - 1]
      top.hasYamlProps = !top.hasYamlProps
      continue
    }

    if (trimmed.startsWith('|')) tableStart = tableStart === -1 ? idx : tableStart
    else if (tableStart !== -1) tableStart = -1

    if (idx === n - 1 && syntaxEnabled && trimmed[0] === ':' && componentStack.length === 0) {
      let c = 0
      while (c < trimmed.length && trimmed[c] === ':') c++
      if (trimmed.slice(c).trim() === '') lines[idx] = ''
    }

    if (syntaxEnabled && trimmed[0] === ':') {
      let colonCount = 0
      while (colonCount < trimmed.length && trimmed[colonCount] === ':') colonCount++
      if (colonCount >= 2) {
        let ie = 0
        while (ie < line.length && (line[ie] === ' ' || line[ie] === '\t')) ie++
        const indent = line.slice(0, ie)
        const ch = trimmed[colonCount] ?? ''
        if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '$') {
          let ne = colonCount
          while (ne < trimmed.length) {
            const c = trimmed[ne]
            if (
              !(
                (c >= 'a' && c <= 'z') ||
                (c >= 'A' && c <= 'Z') ||
                (c >= '0' && c <= '9') ||
                c === '$' ||
                c === '.' ||
                c === '-' ||
                c === '_'
              )
            )
              break
            ne++
          }
          componentStack.push({ depth: colonCount, name: trimmed.slice(colonCount, ne), indent, hasYamlProps: false })
        } else if (colonCount === trimmed.length && componentStack.length > 0) {
          if (componentStack[componentStack.length - 1].depth === colonCount) componentStack.pop()
        }
      }
    }
  }

  // --- Inline heal: last soft-wrapped paragraph at EOF. ---
  // Soft wraps continue the same paragraph (`**bold\r\nwith CRLF` → closes on the
  // joined chunk). A blank line OR a new block-start line (list/heading/fence/…)
  // ends the region so list items and prior paragraphs stay untouched.
  // Skip when still inside an open code fence (including mismatched closer lengths).
  if (!fenceOpen && !inFrontmatter && !inBlockMath) {
    let endIdx = n - 1
    while (endIdx > 0 && lines[endIdx] === '') endIdx--
    if (endIdx >= 0) {
      let startIdx = endIdx
      while (startIdx > 0) {
        const prev = lines[startIdx - 1]
        if (prev === '') break
        // Don't pull a previous line that opens a new block; that line's opener
        // belongs to its own block, not a soft-wrap continuation.
        // Current line must also look like a continuation (not a new block start),
        // except the very first line of the region may be a block opener.
        if (isBlockStartLine(lines[startIdx])) break
        startIdx--
      }
      // Trim: if start line is a block start and there are continuation lines after it,
      // keep the whole soft-wrap paragraph including that opener line
      // (`**bold` + continuation). If start === end, single-line heal as before.

      if (startIdx === endIdx) {
        const healLine = lines[endIdx]
        const trimmedHeal = healLine.trim()
        // Indented code blocks are literal (SPEC: `    *asterisks in indented` stays put),
        // unless the line is a list item (comparison escape / emphasis still apply).
        if (isIndentedCodeLine(healLine) && !isListItemLine(healLine)) {
          // leave alone
        } else {
          const incompleteInlineFence =
            (trimmedHeal.startsWith('```') && trimmedHeal.endsWith('``') && !trimmedHeal.endsWith('```')) ||
            INCOMPLETE_INLINE_FENCE_RE.test(trimmedHeal)
          if (healLine !== '' && trimmedHeal !== '$$' && (!isFenceLine(healLine) || incompleteInlineFence)) {
            let line = healLine
            if (!isFenceLine(healLine) && INCOMPLETE_INLINE_FENCE_RE.test(trimmedHeal) && !trimmedHeal.endsWith('```')) {
              line = healLine + '`'
            }
            lines[endIdx] = healInline(line, healOpts)
          }
        }
      } else {
        // Join soft-wrap paragraphs of plain prose OR a single list item with
        // continuation lines (SPEC: `- **text\nmore text` → close bold across the item).
        // Do not join across a new block start on a later line.
        const startsAsList = isListItemLine(lines[startIdx])
        let canJoin = !isBlockStartLine(lines[startIdx]) || startsAsList
        for (let i = startIdx + 1; i <= endIdx && canJoin; i++) {
          if (isBlockStartLine(lines[i])) canJoin = false
        }
        if (!canJoin) {
          if (!(isIndentedCodeLine(lines[endIdx]) && !isListItemLine(lines[endIdx]))) {
            lines[endIdx] = healInline(lines[endIdx], healOpts)
          }
        } else {
          const chunk = lines.slice(startIdx, endIdx + 1).join('\n')
          const healed = healInline(chunk, healOpts)
          const healedLines = healed.split('\n')
          if (healedLines.length === endIdx - startIdx + 1) {
            for (let i = 0; i < healedLines.length; i++) lines[startIdx + i] = healedLines[i]
          } else if (healedLines.length > endIdx - startIdx + 1) {
            const head = healedLines.slice(0, endIdx - startIdx)
            const tail = healedLines.slice(endIdx - startIdx).join('\n')
            for (let i = 0; i < head.length; i++) lines[startIdx + i] = head[i]
            lines[endIdx] = tail
          } else {
            lines[endIdx] = healInline(lines[endIdx], healOpts)
          }
        }
      }
    }
  }

  let result = lines.join('\n')
  result = applySetextGuard(result)

  if (tablesEnabled && tableStart !== -1) result = closeTables(result)

  if (blockMath && inBlockMath) {
    result += result.endsWith('\n') ? '$$' : '\n$$'
  }

  if (inFrontmatter && frontmatterHasContent) {
    const last = result.includes('\n') ? result.slice(result.lastIndexOf('\n') + 1) : result
    const t = last.trim().replace(/\u200B/g, '')
    if (t === '-' || t === '--') result = result.replace(/\u200B+$/, '') + '-'.repeat(3 - t.length)
    else result += result.endsWith('\n') ? '---' : '\n---'
  }

  if (syntaxEnabled && markdown.includes('::')) {
    const ls = result.lastIndexOf('\n') + 1
    const fl = result.slice(ls)
    let brace = -1
    for (let i = fl.length - 1; i >= 0; i--) {
      if (fl[i] === '}') break
      if (fl[i] === '{') {
        brace = i
        break
      }
    }
    if (brace >= 0) {
      const body = fl.slice(brace + 1)
      let dq = 0,
        sq = 0
      for (let i = 0; i < body.length; i++) {
        if (body[i] === '"') dq++
        if (body[i] === "'") sq++
      }
      result += (dq % 2 === 1 ? '"' : '') + (sq % 2 === 1 ? "'" : '') + '}'
    }
    if (componentStack.length > 0) {
      const top = componentStack[componentStack.length - 1]
      const nt = result
        .slice(result.lastIndexOf('\n') + 1)
        .trim()
        .replace(/\u200B/g, '')
      if (top.hasYamlProps && (nt === '-' || nt === '--')) {
        result = result.replace(/\u200B+$/, '') + '-'.repeat(3 - nt.length)
        top.hasYamlProps = false
      }
      const closers: string[] = []
      while (componentStack.length) {
        const c = componentStack.pop()!
        if (c.hasYamlProps) closers.push(c.indent + '---')
        closers.push(c.indent + ':'.repeat(c.depth))
      }
      result += '\n' + closers.join('\n')
    }
  }

  return result
}

// Shared scanners (hoisted so autoCloseMarkdown does not re-create them per call).
const RAW_TEXT_OPEN_RE = /^<(script|pre|style|textarea)(\s|>|$)/i
const RAW_TEXT_CLOSE_RE = {
  script: /<\/script\s*>/i,
  pre: /<\/pre\s*>/i,
  style: /<\/style\s*>/i,
  textarea: /<\/textarea\s*>/i,
} as const

const LIST_COMPARE_PREFIX_RE = /^(\s*(?:[-*+]|\d+[.)]) +)$/
const LIST_COMPARE_VALUE_RE = /^=?\s*\$?\d/
const TRAILING_YAML_KEY_RE = /^[ \t]*[A-Za-z_][\w.-]*: $/
const INCOMPLETE_INLINE_FENCE_RE = /```[^\n`]*``$/
const ATX_HEADING_RE = /^#{1,6}(\s|$)/
const THEMATIC_BREAK_RE = /^(\*{3,}|_{3,}|-{3,})\s*$/
const ORDERED_LIST_RE = /^\d{1,9}[.)](\s|$)/

/** True for a CommonMark fence opener/closer line (``` or ~~~, length ≥ 3). */
function isFenceLine(line: string): boolean {
  let i = 0
  while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++
  const ch = line[i]
  if (ch !== '`' && ch !== '~') return false
  let n = 0
  while (i + n < line.length && line[i + n] === ch) n++
  return n >= 3
}

/**
 * True when a line starts a new block (list, heading, quote, fence, hr, table,
 * indented code), so soft-wrap paragraph joining must not cross it.
 */
function isBlockStartLine(line: string): boolean {
  if (!line) return false
  if (isFenceLine(line)) return true
  if (isIndentedCodeLine(line)) return true
  const t = line.trimStart()
  if (!t) return false
  const c0 = t.charCodeAt(0)
  if (c0 === 35 /* # */ && ATX_HEADING_RE.test(t)) return true
  if (c0 === 62 /* > */) return true
  if ((c0 === 42 || c0 === 95 || c0 === 45) && THEMATIC_BREAK_RE.test(t)) return true
  if (c0 === 124 /* | */) return true
  if ((c0 === 45 || c0 === 43 || c0 === 42) && (t.charCodeAt(1) === 32 || t.charCodeAt(1) === 9)) return true
  if (c0 >= 48 && c0 <= 57 && ORDERED_LIST_RE.test(t)) return true
  return false
}

/**
 * CommonMark indented code block line: ≥4 leading spaces, or a leading tab.
 * Content is literal — do not auto-close emphasis inside it.
 */
function isIndentedCodeLine(line: string): boolean {
  if (!line) return false
  if (line[0] === '\t') return true
  let i = 0
  while (i < line.length && line[i] === ' ') i++
  return i >= 4 && i < line.length
}

/** True for an unordered/ordered list item line (indent allowed). */
function isListItemLine(line: string): boolean {
  if (!line) return false
  const t = line.trimStart()
  if (!t) return false
  const c0 = t.charCodeAt(0)
  if ((c0 === 45 || c0 === 43 || c0 === 42) && (t.charCodeAt(1) === 32 || t.charCodeAt(1) === 9)) return true
  if (c0 >= 48 && c0 <= 57 && ORDERED_LIST_RE.test(t)) return true
  return false
}

// Compiled once — avoid re-creating the Unicode property regex on every call.
const WORD_CP_RE = /\p{L}|\p{N}/u

function isWord(ch: string): boolean {
  if (!ch) return false
  const c = ch.charCodeAt(0)
  // Fast path: pure ASCII alnum/_ covers nearly all markdown without Unicode tests.
  if (c <= 127) {
    return (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95
  }
  const cp = ch.codePointAt(0)
  if (cp === undefined) return false
  // BMP: test the unit string as-is. Astral: allocate one code-point string.
  if (c < 0xd800 || c > 0xdbff) return WORD_CP_RE.test(ch)
  return WORD_CP_RE.test(String.fromCodePoint(cp))
}

/** Full code-point char before index `i` (handles surrogate pairs). */
function codePointBefore(text: string, i: number): string {
  if (i <= 0) return ''
  const c = text.charCodeAt(i - 1)
  // low surrogate: pair with previous high surrogate
  if (c >= 0xdc00 && c <= 0xdfff && i >= 2) {
    const hi = text.charCodeAt(i - 2)
    if (hi >= 0xd800 && hi <= 0xdbff) return text.slice(i - 2, i)
  }
  return text[i - 1] ?? ''
}

/** Full code-point char at index `i` (handles surrogate pairs). */
function codePointAt(text: string, i: number): string {
  if (i < 0 || i >= text.length) return ''
  const c = text.charCodeAt(i)
  if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length) {
    const lo = text.charCodeAt(i + 1)
    if (lo >= 0xdc00 && lo <= 0xdfff) return text.slice(i, i + 2)
  }
  return text[i] ?? ''
}

function isSpace(ch: string): boolean {
  return ch === '' || ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r'
}

/** Trailing chars dropped when `dropTrailingOpeners` is on so incomplete openers do not flash. */
// Space-flanked trailing openers dropped under streaming (`hello *` → `hello`).
// Includes `~` / `` ` `` so half-typed strike/code does not flash either.
const TRAILING_OPENERS = '*_$:`~[{!'
function isTrailingOpenerChar(c: number): boolean {
  return (
    c === 42 || c === 95 || c === 36 || c === 58 || c === 96 || c === 126 || c === 91 || c === 123 || c === 33
  )
}

/**
 * Drop a trailing opener run (`* _ $ : \` ~ [ { !`) at EOF when it is preceded by
 * whitespace (`hello *` → `hello`). Attached markers (`**bold`, `$x`) stay so
 * the later heal can still close them — except a bare trailing `$` after a word
 * (`text123$` → `text123`), which is dropped under streaming so a half-typed
 * math opener does not flash.
 */
function dropTrailingOpeners(text: string): string {
  let ws = text.length
  while (ws > 0) {
    const c = text[ws - 1]
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') ws--
    else break
  }
  if (ws === 0) return text

  // Drop only the last opener run (`*`, `**`, `$`, …). An earlier space-separated
  // `*` in `hello * *` is already followed by space, so it cannot become syntax.
  let i = ws
  while (i > 0 && isTrailingOpenerChar(text.charCodeAt(i - 1))) {
    if (i >= 2 && text[i - 2] === '\\') break
    i--
  }
  if (i === ws) return text

  const before = i > 0 ? text[i - 1] : ''
  const run = text.slice(i, ws)

  // Bare trailing `$` / `$$` after a word char: drop (`text123$` → `text123`).
  // Does not touch `$x` (opener followed by content — handled earlier as non-trailing).
  let allDollar = run.length > 0
  for (let r = 0; r < run.length && allDollar; r++) if (run.charCodeAt(r) !== 36) allDollar = false
  if (allDollar && isWord(codePointBefore(text, i))) {
    return text.slice(0, i) + text.slice(ws)
  }

  // Only drop other openers when that run is space-flanked (preceded by whitespace or BOS)
  if (before !== '' && before !== ' ' && before !== '\t' && before !== '\n' && before !== '\r') {
    return text
  }

  let keep = i
  if (keep > 0 && (text[keep - 1] === ' ' || text[keep - 1] === '\t')) keep--
  return text.slice(0, keep) + text.slice(ws)
}

// ---------------------------------------------------------------------------
// One O(n) document heal
// ---------------------------------------------------------------------------

interface HealOpts {
  attributesEnabled: boolean
  linkMode: LinkMode
  linkPh: string
  imagePh: string
  blockMath: boolean
  inlineMath: boolean
  links: boolean
  images: boolean
  bold: boolean
  italic: boolean
  strikethrough: boolean
  inlineCode: boolean
  boldItalic: boolean
  singleTilde: boolean
  comparisonOperators: boolean
  htmlTags: boolean
}

type Marker = '***' | '**' | '*' | '__' | '_' | '~~' | '`' | '$$' | '$'

/** Inline heal for a single line. Previous lines are assumed already legitimate. */
function healInline(text: string, opts: HealOpts): string {
  // 1) Trailing single space
  if (text.endsWith(' ') && !text.endsWith('  ')) {
    const nl = text.lastIndexOf('\n')
    const last = nl === -1 ? text : text.slice(nl + 1)
    if (!TRAILING_YAML_KEY_RE.test(last)) text = text.slice(0, -1)
  }

  // 2) Build mutated string for escapes while collecting open markers
  const len = text.length
  // String builder: V8 rope-concats short heals cheaply; avoids per-char array push + join.
  let out = ''
  let stack: Marker[] = []

  let fence = false
  let inCode = false
  // the length of the backtick run that opened the current span: only a run of
  // the same length closes it, any other run is literal inside it
  let codeRun = 0
  // where that span's content starts in `out`
  let codeStart = 0
  let inMath = false
  let inBlockMath = false
  let inLatexI = false
  let inLatexB = false
  let inAttr = 0
  let lineStartSrc = 0

  // Incomplete link state
  let bracketDepth = 0
  let linkUrlOpen = false // saw ](

  let lastLtOut = -1

  // Asterisk/underscore pair tracking for "balanced overlapping" check
  let asteriskTotal = 0
  let doubleAsteriskCount = 0
  let tripleCount = 0
  // Source index of each open `*` so word-internal soft-close can inspect its span
  const starOpenAt: number[] = []

  /** Open only when the run is not followed by space; close only when not preceded by space. */
  const toggleFlanking = (m: Marker, prevCh: string, afterCh: string, openAt = -1) => {
    const canClose = !isSpace(prevCh) && stack[stack.length - 1] === m
    const canOpen = !isSpace(afterCh)
    if (canClose) {
      stack.pop()
      if (m === '*') starOpenAt.pop()
    } else if (canOpen) {
      stack.push(m)
      if (m === '*' && openAt >= 0) starOpenAt.push(openAt)
    }
  }

  const toggle = (m: Marker) => {
    if (stack[stack.length - 1] === m) stack.pop()
    else stack.push(m)
  }

  for (let i = 0; i < len; i++) {
    const ch = text[i]
    const prev = i > 0 ? text[i - 1] : ''
    const next = i + 1 < len ? text[i + 1] : ''

    // Newline
    if (ch === '\n') {
      out += ch
      lineStartSrc = i + 1
      continue
    }

    // Fence at line start (``` or ~~~) OR incomplete inline ```...``
    if (i === lineStartSrc || (i > 0 && text[i - 1] === '\n')) {
      let j = i
      while (j < len && (text[j] === ' ' || text[j] === '\t')) j++
      const fenceCh = text[j]
      if (fenceCh === '`' || fenceCh === '~') {
        let n = 0
        while (j + n < len && text[j + n] === fenceCh) n++
        if (n >= 3) {
          let lineEnd = j
          while (lineEnd < len && text[lineEnd] !== '\n') lineEnd++
          const lineBody = text.slice(j, lineEnd)
          // Incomplete inline backtick fence: ```python print("Hello")``
          if (
            fenceCh === '`' &&
            lineBody.startsWith('```') &&
            lineBody.endsWith('``') &&
            !lineBody.endsWith('```') &&
            !lineBody.slice(3).includes('```')
          ) {
            out += text.slice(i, lineEnd)
            i = lineEnd
            out += '`'
            i--
            continue
          }
          fence = !fence
          {
            const _nl = text.indexOf('\n', i)
            const _end = _nl === -1 ? len : _nl
            out += text.slice(i, _end)
            i = _end
          }
          if (i < len) {
            out += '\n'
            lineStartSrc = i + 1
          } else i--
          continue
        }
      }
    }

    if (fence) {
      out += ch
      continue
    }

    // Escape
    if (ch === '\\') {
      out += ch
      if (i + 1 < len) {
        out += text[++i]
      }
      continue
    }

    // List comparison operator (`- > 25` → `- \> 25`). Also handles deeply indented
    // list items (`    - > 5`) that would otherwise look like indented code blocks.
    if (opts.comparisonOperators && ch === '>') {
      let ls = i
      while (ls > 0 && text[ls - 1] !== '\n') ls--
      const prefix = text.slice(ls, i)
      // Marker may be preceded by any indent (including ≥4 spaces).
      if (LIST_COMPARE_PREFIX_RE.test(prefix) && LIST_COMPARE_VALUE_RE.test(text.slice(i + 1))) {
        out += '\\>'
        continue
      }
    }

    // Single ~ between word chars: escape mid-word tildes so GFM does not treat
    // them as strikethrough (`20~25` → `20\~25`). Leave digit-subscript pairs alone
    // (`H~2~o` stays). Path-like `foo~bar~baz` still escapes every mid-word `~`.
    if (opts.singleTilde && ch === '~' && next !== '~' && prev !== '~') {
      const prevCp = codePointBefore(text, i)
      const nextCp = codePointAt(text, i + 1)
      if (isWord(prevCp) && isWord(nextCp) && !inCode && !inMath && !inBlockMath && !isPairedSingleTilde(text, i)) {
        out += '\\~'
        continue
      }
    }

    // Regions that protect markers (must run before HTML tag tracking so
    // content inside incomplete inline code/`$` is never stripped as HTML).
    if (inCode) {
      if (ch === '`') {
        let n = 0
        while (i + n < len && text[i + n] === '`') n++
        out += '`'.repeat(n)
        i += n - 1
        if (n === codeRun) {
          inCode = false
          if (stack[stack.length - 1] === '`') stack.pop()
        }
        continue
      }
      out += ch
      continue
    }

    // HTML incomplete tracking (attribute values protect `_` / `*` inside quoted attrs)
    if (ch === '<' && ((next >= 'a' && next <= 'z') || (next >= 'A' && next <= 'Z') || next === '/')) {
      lastLtOut = out.length
    }
    if (ch === '>') lastLtOut = -1

    // Inside a complete/incomplete HTML tag: do not count emphasis markers in attributes
    if (lastLtOut >= 0) {
      out += ch
      continue
    }
    if (inBlockMath) {
      // Inline code may open inside an unfinished $$ region so the dollars in
      // `` `$$` `` stay literal (SPEC: `Math: $$x+y and code: `$$`` → …`$$`$$).
      if (ch === '`' && opts.inlineCode) {
        let end = i
        while (end + 1 < len && text[end + 1] === '`') end++
        const run = end - i + 1
        if (run < 3) {
          codeRun = run
          out += '`'.repeat(codeRun)
          i = end
          inCode = true
          codeStart = out.length
          stack.push('`')
          continue
        }
      }
      out += ch
      if (ch === '$' && next === '$') {
        out += '$'
        i++
        inBlockMath = false
        if (stack[stack.length - 1] === '$$') stack.pop()
      }
      continue
    }
    if (inMath) {
      out += ch
      if (ch === '$' && next !== '$') {
        inMath = false
        if (stack[stack.length - 1] === '$') stack.pop()
      }
      continue
    }
    if (inLatexI) {
      out += ch
      if (ch === '\\' && next === ')') {
        out += ')'
        i++
        inLatexI = false
      }
      continue
    }
    if (inLatexB) {
      out += ch
      if (ch === '\\' && next === ']') {
        out += ']'
        i++
        inLatexB = false
      }
      continue
    }

    // Attributes
    if (opts.attributesEnabled && ch === '{' && prev && prev !== ' ' && prev !== '\t' && prev !== '\n') {
      inAttr++
      out += ch
      continue
    }
    if (opts.attributesEnabled && ch === '}') {
      if (inAttr > 0) inAttr--
      out += ch
      continue
    }
    if (inAttr > 0) {
      out += ch
      continue
    }

    // Links / brackets — track but copy through; rewrite at end
    if (ch === '[') {
      bracketDepth++
      out += ch
      continue
    }
    if (ch === ']') {
      if (bracketDepth > 0) bracketDepth--
      out += ch
      if (next === '(') {
        linkUrlOpen = true
      }
      continue
    }
    if (linkUrlOpen) {
      out += ch
      if (ch === ')' && bracketDepth === 0) {
        // crude: closed
        linkUrlOpen = false
      }
      continue
    }

    // Skip emphasis counts while inside unclosed link text
    if (bracketDepth > 0) {
      out += ch
      continue
    }

    // Code
    if (ch === '`' && opts.inlineCode) {
      // Count full backtick run
      let end = i
      while (end + 1 < len && text[end + 1] === '`') end++
      const run = end - i + 1

      // Triple+ on non-line-start: leave as fence-like material, do not open inline code
      // (block incomplete fences like `see ```inline code`` are completed above).
      if (run >= 3) {
        out += '`'.repeat(run)
        i = end
        continue
      }

      codeRun = run
      out += '`'.repeat(codeRun)
      i = end
      inCode = true
      codeStart = out.length
      stack.push('`')
      continue
    }

    // Math
    if (ch === '$') {
      // Count the full run of `$` so `$$$` / `$$$$` are not half-opened as `$$` + `$`
      // (SPEC leave-alone cases).
      let end = i
      while (end + 1 < len && text[end + 1] === '$') end++
      const run = end - i + 1

      if (run >= 3) {
        // Odd triple+ runs (`$$$`, `$$$$$`, …) are not valid math openers — copy through.
        out += '$'.repeat(run)
        i = end
        continue
      }

      if (run === 2) {
        out += '$$'
        i = end
        if (opts.blockMath) {
          inBlockMath = !inBlockMath
          toggle('$$')
        }
        continue
      }

      // run === 1
      out += ch
      if (opts.inlineMath && looksLikeInlineMathOpen(text, i)) {
        // Skip currency (`$100`) and component names (`::$special`)
        inMath = true
        stack.push('$')
      }
      continue
    }

    // LaTeX \( \[  — backslash already handled for escapes; detect when we see them as two chars without entering escape?
    // Paths with `\(` start with `\`, caught above. For `$` math we protect. Skip.

    // Emphasis *
    if (ch === '*') {
      let end = i
      while (end + 1 < len && text[end + 1] === '*') end++
      const run = end - i + 1
      const after = end + 1 < len ? text[end + 1] : ''
      // Space after an opener (`** something`) is not emphasis — CommonMark flanking.
      const leftSpace = isSpace(prev)
      const rightSpace = isSpace(after)
      const surroundedSingle = run === 1 && leftSpace && rightSpace

      // emit chars
      out += '*'.repeat(end - i + 1)

      if (!surroundedSingle) {
        // Word-internal single * (`a*b`):
        // Soft-close a *open* only when its content is a pure single word AND the
        // rest of the line is NOT a `*word*word*…` path (`*a*b` closes; `*foo*bar*baz` keeps opener).
        if (run === 1 && isWord(prev) && isWord(after)) {
          if (opts.italic && stack[stack.length - 1] === '*' && starOpenAt.length) {
            const openSrc = starOpenAt[starOpenAt.length - 1]
            let pureWord = openSrc >= 0
            for (let k = openSrc + 1; k < i && pureWord; k++) {
              if (!isWord(text[k])) pureWord = false
            }
            // Path continues if ≥1 more `*word` segment appears later on this line
            let pathSegs = 0
            let k = end + 1
            while (k < len && text[k] !== '\n') {
              if (!isWord(text[k])) break
              while (k < len && isWord(text[k])) k++
              if (k < len && text[k] === '*' && (k + 1 >= len || text[k + 1] !== '*')) {
                pathSegs++
                k++
                continue
              }
              break
            }
            if (pureWord && pathSegs === 0) {
              asteriskTotal += run
              stack.pop()
              starOpenAt.pop()
              i = end
              continue
            }
          }
          i = end
          continue
        }
        asteriskTotal += run
        if (run === 1) {
          if (opts.italic) toggleFlanking('*', prev, after, i)
        } else if (run === 2) {
          if (opts.bold) {
            doubleAsteriskCount++
            toggleFlanking('**', prev, after)
          }
        } else if (run >= 3) {
          // Horizontal rule: a whole line of ≥3 * (with only spaces) is not emphasis
          let ls = i
          while (ls > 0 && text[ls - 1] !== '\n') ls--
          let le = end + 1
          while (le < len && text[le] !== '\n') le++
          const lineContent = text.slice(ls, le)
          let onlyStars = true
          for (let li = 0; li < lineContent.length; li++) {
            const c = lineContent[li]
            if (c !== '*' && c !== ' ' && c !== '\t') {
              onlyStars = false
              break
            }
          }
          if (onlyStars) {
            // leave stack alone — thematic break
            i = end
            continue
          }

          if (run === 3) {
            // *** as bold-italic opener/closer, OR overlapping close for open * + **
            const hasStar = stack.includes('*')
            const hasBold = stack.includes('**')
            if (hasStar && hasBold && !leftSpace) {
              for (let si = stack.length - 1; si >= 0; si--) {
                if (stack[si] === '*' || stack[si] === '**') {
                  if (stack[si] === '*') starOpenAt.pop()
                  stack.splice(si, 1)
                }
              }
              doubleAsteriskCount++
            } else if (opts.boldItalic) {
              tripleCount++
              toggleFlanking('***', prev, after)
            } else {
              // Fall back to enabled parts of a 3-run when bold-italic is off
              if (opts.bold) {
                doubleAsteriskCount++
                toggleFlanking('**', prev, after)
              }
              if (opts.italic) toggleFlanking('*', prev, after, i)
            }
          } else {
            // ****+ : open as pairs of `**` (+ optional trailing `*`).
            // SPEC: `****text` → `****text****`, `*****text` → `*****text*****`.
            // Do NOT treat as `***` + leftover — that collapses the closer to 3 stars.
            if (!rightSpace) {
              if (opts.bold) {
                const pairs = Math.floor(run / 2)
                for (let p = 0; p < pairs; p++) {
                  doubleAsteriskCount++
                  stack.push('**')
                }
              }
              if (run % 2 === 1 && opts.italic) {
                stack.push('*')
                starOpenAt.push(i)
              }
            }
          }
          i = end
          continue
        }
      }
      i = end
      continue
    }

    if (ch === '_') {
      let end = i
      while (end + 1 < len && text[end + 1] === '_') end++
      const run = end - i + 1
      const after = end + 1 < len ? text[end + 1] : ''
      const surrounded = isSpace(prev) && isSpace(after)
      out += '_'.repeat(end - i + 1)

      // Horizontal rule: line of only _ (3+)
      if (run >= 3) {
        let ls = i
        while (ls > 0 && text[ls - 1] !== '\n') ls--
        let le = end + 1
        while (le < len && text[le] !== '\n') le++
        const lineContent = text.slice(ls, le)
        let only = true
        for (let li = 0; li < lineContent.length; li++) {
          const c = lineContent[li]
          if (c !== '_' && c !== ' ' && c !== '\t') {
            only = false
            break
          }
        }
        if (only) {
          i = end
          continue
        }
      }

      // Escaped `_` left of a run is still a `_` char in the source prev — do not
      // treat it as a word-boundary that suppresses `__` stacking (`\___bold`).
      const wordLeft = isWord(prev) && prev !== '_'
      const wordRight = isWord(after)
      // Underscore openers: refuse when left is `(` (SPEC: `func(_arg`, `(_note`).
      // Whitespace / BOS / emphasis markers (`*` `_`) / escapes still open
      // (`**_text` → `**_text_**`, `\___bold` → `\___bold__`).
      // Closers still work with punctuation after (`_done).`).
      const prevEscaped = i >= 2 && text[i - 1] === '_' && text[i - 2] === '\\'
      const leftOkForOpen =
        prev !== '(' &&
        (prev === '' || isSpace(prev) || prev === '\n' || prev === '\r' || prev === '*' || prev === '_' || prevEscaped)
      if (!(wordLeft && wordRight) && !surrounded) {
        // Underscore runs: `_` italic, `__` strong. Triple `___` is strong+em.
        if (run === 1) {
          if (opts.italic) {
            const canClose = !isSpace(prev) && stack[stack.length - 1] === '_'
            const canOpen = leftOkForOpen && !isSpace(after)
            if (canClose) stack.pop()
            else if (canOpen) stack.push('_')
          }
        } else if (run === 3) {
          const hasEm = stack.includes('_')
          const hasStrong = stack.includes('__')
          if (hasEm && hasStrong && !isSpace(prev)) {
            for (let si = stack.length - 1; si >= 0; si--) {
              if (stack[si] === '_' || stack[si] === '__') stack.splice(si, 1)
            }
          } else if (leftOkForOpen && !isSpace(after)) {
            if (opts.bold) stack.push('__')
            if (opts.italic) stack.push('_')
          }
        } else if (run >= 2) {
          if (opts.bold) {
            const pairs = Math.floor(run / 2)
            for (let p = 0; p < pairs; p++) {
              const canClose = !isSpace(prev) && stack[stack.length - 1] === '__'
              const canOpen = leftOkForOpen && !isSpace(after)
              if (canClose) stack.pop()
              else if (canOpen) stack.push('__')
            }
          }
          if (run % 2 === 1 && opts.italic) {
            const canClose = !isSpace(prev) && stack[stack.length - 1] === '_'
            const canOpen = leftOkForOpen && !isSpace(after)
            if (canClose) stack.pop()
            else if (canOpen) stack.push('_')
          }
        }
      }
      i = end
      continue
    }

    if (ch === '~') {
      let end = i
      while (end + 1 < len && text[end + 1] === '~') end++
      const run = end - i + 1
      const after = end + 1 < len ? text[end + 1] : ''
      const surrounded = isSpace(prev) && isSpace(after)
      out += '~'.repeat(end - i + 1)
      if (opts.strikethrough && !surrounded && run >= 2) {
        const pairs = Math.floor(run / 2)
        for (let p = 0; p < pairs; p++) toggleFlanking('~~', prev, after)
      }
      // single ~ not stacked (SPEC escapes or leaves alone)
      i = end
      continue
    }

    out += ch
  }

  let result = out

  // Incomplete HTML strip (`Hello <div` → `Hello`)
  if (opts.htmlTags && lastLtOut >= 0) {
    // map: lastLtOut is index into out at time of `<` — still valid after join length if only escaped longer...
    // We pushed at lastLtOut; result may be longer only if we added escapes before.
    // Safer rescan end:
    result = stripIncompleteHtmlEnd(result)
  }

  // Incomplete links / images
  if (opts.links || opts.images) {
    const linked = healLinks(result, opts)
    if (linked !== result) {
      // If protocol incomplete link, SPEC early-returns before other emphasis (links win)
      if (
        opts.linkMode === 'protocol' &&
        (linked.endsWith(`](${opts.linkPh})`) || linked.endsWith(`](${opts.imagePh})`))
      ) {
        return linked
      }
      result = linked
      // text-only: continue to close other markers on the result? rarely needed
    }
  }

  // If still in fence path we shouldn't be here

  // Close open markers (stack) — skip empty / HR / bare
  if (stack.length === 0) {
    return result
  }

  // Bare / HR: don't close
  if (isBareOrHr(result)) return result

  // Still inside open inline code at EOF.
  // Always close the code span first, then remaining outer openers:
  //   ***bold-italic with `code → ***bold-italic with `code`***
  //   Text **bold `code          → Text **bold `code`**
  //   *italic **bold ~~strike `code → …`code`~~***
  // Markers opened after the open ` (while inCode) stay literal inside the span.
  if (inCode && opts.inlineCode) {
    const content = result.slice(codeStart).replace(/`+$/, '')
    if (content.length > 0) {
      let codeIdx = -1
      for (let si = 0; si < stack.length; si++) if (stack[si] === '`') codeIdx = si

      const before: Marker[] = []
      if (codeIdx > 0) {
        for (let si = codeIdx - 1; si >= 0; si--) {
          const m = stack[si]
          if (isMarkerEnabled(m, opts)) before.push(m)
        }
      }

      let trail = 0
      while (trail < result.length && result[result.length - 1 - trail] === '`') trail++
      if (trail > codeRun) return result

      // Collapse same-family star closers: [* , **] → *** ; single ** stays **
      const closeOutside = (markers: Marker[]): string => {
        const hasStar = markers.includes('*')
        const hasBold = markers.includes('**')
        const hasTriple = markers.includes('***')
        let s = ''
        let skippedStarFamily = false
        for (const m of markers) {
          if (m === '*' || m === '**' || m === '***') {
            if (skippedStarFamily) continue
            skippedStarFamily = true
            if (hasTriple || (hasStar && hasBold)) s += '***'
            else if (hasBold) s += '**'
            else s += '*'
          } else {
            s += m
          }
        }
        return s
      }

      return result + '`'.repeat(codeRun - trail) + closeOutside(before)
    }
    return result
  }

  // Build suffix inside-out with half-close handling
  let closeStack = stack.filter((m) => isMarkerEnabled(m, opts))
  // SPEC: `**bold *italic` with italic:false leaves the line alone (do not close **
  // around a bare single-star that was never tracked as emphasis).
  if (!opts.italic && closeStack.includes('**')) {
    // bare single * run somewhere after a ** opener?
    if (/(?:^|[^*])\*(?:[^*]|$)/.test(result) && !closeStack.includes('*')) {
      closeStack = closeStack.filter((m) => m !== '**' && m !== '***')
    }
  }
  result = closeOpenStack(result, closeStack, {
    asteriskTotal,
    doubleAsteriskCount,
    tripleCount,
  })

  return result
}

function stripIncompleteHtmlEnd(text: string): string {
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] === '>') return text
    if (text[i] === '\n') return text
    if (text[i] === '<') {
      const n = text[i + 1] ?? ''
      if ((n >= 'a' && n <= 'z') || (n >= 'A' && n <= 'Z') || n === '/') {
        return text.slice(0, i).replace(/[ \t]+$/, '')
      }
      return text
    }
  }
  return text
}

function isBareOrHr(text: string): boolean {
  // Only check last line
  const nl = text.lastIndexOf('\n')
  const last = (nl === -1 ? text : text.slice(nl + 1)).trim()
  if (!last) return false
  if (
    last === '*' ||
    last === '**' ||
    last === '***' ||
    last === '****' ||
    last === '_' ||
    last === '__' ||
    last === '___' ||
    last === '~' ||
    last === '~~' ||
    last === '`'
  )
    return true
  if (/^\*{3,}$/.test(last) || /^_{3,}$/.test(last) || /^-{3,}$/.test(last)) return true
  return false
}

function closeOpenStack(
  text: string,
  stack: Marker[],
  counts: { asteriskTotal: number; doubleAsteriskCount: number; tripleCount: number }
): string {
  // Half-closes first — only when this is the sole remaining star-family closer
  // (do not early-return past cross-family openers like `~~` or a second `**`).
  const starOnly =
    !stack.includes('~~') &&
    !stack.includes('__') &&
    !stack.includes('_') &&
    !stack.includes('$$') &&
    !stack.includes('$')
  const boldOpenCount = stack.filter((m) => m === '**').length
  if (starOnly && /\*\*\*[^*]+\*{1,2}$/.test(text) && !/\*{3}$/.test(text)) {
    const trail = text.match(/\*+$/)?.[0].length ?? 0
    if (trail >= 1 && trail <= 2 && (stack.includes('***') || counts.tripleCount % 2 === 1)) {
      return text + '*'.repeat(3 - trail)
    }
  }
  if (
    starOnly &&
    boldOpenCount <= 1 &&
    /\*\*[^*]+\*$/.test(text) &&
    stack.includes('**') &&
    !stack.includes('***') &&
    !stack.includes('*')
  ) {
    // e.g. `**bold*` half-close → `**bold**` when nothing else is open
    return text + '*'
  }
  // Half-close strong underscore: `__text_` → `__text__` (not `___`).
  // Apply even when a stray single `_` is also on the stack from mis-nesting.
  if (/__[^_]+_$/.test(text) && !/_{3,}$/.test(text) && stack.includes('__')) {
    // Prefer completing `__` over emitting a lone italic closer
    return text + '_'
  }
  // Half-close strike regardless of other openers: `~~strike~` → `~~strike~~`.
  // Only when ~~ is the sole remaining closer worth finishing this way (no other
  // incomplete markers that still need their full closers after).
  if (
    /~~[^~]+~$/.test(text) &&
    stack.includes('~~') &&
    !stack.includes('*') &&
    !stack.includes('**') &&
    !stack.includes('***') &&
    !stack.includes('_') &&
    !stack.includes('__') &&
    !stack.includes('$$') &&
    !stack.includes('$')
  ) {
    return text + '~'
  }

  // Balanced overlapping: Combined **bold and *italic*** text
  // ** opens, * opens, *** closes both → residual openers may remain on the stack.
  // Only clear them when the source already ends with a multi-star closer after
  // content. Pure openers like `****text` must stay open so they get a closer.
  const hasTerminalStarCloser = /[^*\s]\*{2,}$/.test(text)
  const balancedOverlap =
    hasTerminalStarCloser &&
    counts.doubleAsteriskCount >= 2 &&
    counts.doubleAsteriskCount % 2 === 0 &&
    counts.asteriskTotal % 2 === 0

  let workStack = stack.slice()
  if (balancedOverlap) {
    workStack = workStack.filter((m) => m !== '***' && m !== '**' && m !== '*')
  }

  // SPEC nested formatting: close from the inside (stack top first).
  // Same-family incomplete * inside ** collapses to *** at EOF:
  //   `This is **bold with *ital` → `…*ital***`
  //   `**bold then *italic then ~~strike` → `…~~***`
  // Cross-family still nests:
  //   `_italic and **bold` → `_italic and **bold**_`
  //   `~~strike with **bold` → `~~strike with **bold**~~`

  const closable: Marker[] = []
  // Scan stack from top (innermost)
  for (let i = workStack.length - 1; i >= 0; i--) {
    const m = workStack[i]
    if (m === '$$') {
      closable.push('$$')
      continue
    }
    if (m === '$') {
      closable.push('$')
      continue
    }
    if (m === '`') continue

    const token = m
    const pos = text.lastIndexOf(token)
    if (pos < 0) continue
    const after = text.slice(pos + token.length)
    if (!hasClosableContentAfter(after)) continue
    closable.push(m)
  }

  if (closable.length === 0) return text

  // Collapse same-family asterisk closers:
  //   * + **  → ***   (incomplete nest at EOF: `**bold with *ital` → `…***`)
  //   ** + ** → ****  (multi strong open: `****text` → `…****`)
  //   lone * / ** / *** stay as-is
  // When a cross-family outer is also open (`~~…**bold *italic`), only close the
  // innermost star and leave the outer strong open:
  //   `~~strike **bold *italic` → `…*italic*~~`
  const hasStar = closable.includes('*')
  const hasBold = closable.includes('**')
  const hasTriple = closable.includes('***')
  const hasCrossFamily = closable.some((m) => m === '~~' || m === '__' || m === '_' || m === '$$' || m === '$')
  const boldCount = closable.filter((m) => m === '**').length

  let suffix = ''
  let emittedStarFamily = false
  for (const m of closable) {
    if (m === '*' || m === '**' || m === '***') {
      if (emittedStarFamily) continue
      emittedStarFamily = true
      if (hasTriple) {
        suffix += '***'
      } else if (hasStar && hasBold) {
        // Nested * inside **. When * is innermost and a cross-family outer is still
        // open (`~~strike **bold *italic`), only close the * so outer strong stays:
        //   → `…*italic*~~`
        // A multi-pair open like `*****text` (two ** + *) closes the full run.
        // A single ** + * nest closes as *** (`**bold with *ital` → `…***`).
        const innermostIsStar = closable[0] === '*'
        if (innermostIsStar && hasCrossFamily) suffix += '*'
        else if (boldCount >= 2) suffix += '*'.repeat(boldCount * 2 + 1)
        else suffix += '***'
      } else if (hasBold) {
        suffix += '**'.repeat(Math.max(1, boldCount))
      } else {
        suffix += '*'
      }
      continue
    }
    if (m === '$$') {
      if (text.endsWith('$') && !text.endsWith('$$')) suffix += '$'
      else {
        const first = text.indexOf('$$')
        const multi = first !== -1 && text.indexOf('\n', first) !== -1
        suffix += multi && !text.endsWith('\n') ? '\n$$' : '$$'
      }
    } else {
      suffix += m
    }
  }

  if (text.endsWith(' ') && !text.endsWith('  ')) return text.slice(0, -1) + suffix

  // Insert closers before trailing newlines (SPEC: `_italic\n` → `_italic_\n`)
  let end = text.length
  while (end > 0 && text[end - 1] === '\n') end--
  if (end < text.length) return text.slice(0, end) + suffix + text.slice(end)

  return text + suffix
}

function isMarkerEnabled(m: Marker, opts: HealOpts): boolean {
  if (m === '***') return opts.boldItalic
  if (m === '**' || m === '__') return opts.bold
  if (m === '*' || m === '_') return opts.italic
  if (m === '~~') return opts.strikethrough
  if (m === '`') return opts.inlineCode
  if (m === '$$') return opts.blockMath
  if (m === '$') return opts.inlineMath
  return true
}

/** Drop `[` that never get a matching `]`; keep complete nested pairs intact. */
function stripUnclosedBrackets(text: string): string {
  let out = ''
  const opens: number[] = []
  for (let k = 0; k < text.length; k++) {
    if (text[k] === '[') opens.push(out.length)
    else if (text[k] === ']' && opens.length) opens.pop()
    out += text[k]
  }
  for (let oi = opens.length - 1; oi >= 0; oi--) {
    out = out.slice(0, opens[oi]) + out.slice(opens[oi] + 1)
  }
  return out
}

function healLinks(text: string, opts: HealOpts): string {
  // Don't touch inside fences — simple: if unfinished fence to EOF, caller skipped heal
  const lastParen = text.lastIndexOf('](')
  if (lastParen !== -1) {
    const after = text.slice(lastParen + 2)
    if (!after.includes(')') && !isPosInFence(text, lastParen)) {
      let depth = 1
      let open = -1
      for (let i = lastParen - 1; i >= 0; i--) {
        if (text[i] === ']') depth++
        else if (text[i] === '[') {
          depth--
          if (depth === 0) {
            open = i
            break
          }
        }
      }
      if (open >= 0 && !isPosInFence(text, open)) {
        const isImage = open > 0 && text[open - 1] === '!'
        if (isImage && !opts.images) return text
        if (!isImage && !opts.links) return text
        const start = isImage ? open - 1 : open
        const before = text.slice(0, start)
        const alt = text.slice(open + 1, lastParen)
        if (isImage) return `${before}![${alt}](${opts.imagePh})`
        if (opts.linkMode === 'text-only') return before + alt
        return `${before}[${alt}](${opts.linkPh})`
      }
    }
  }

  // Prefer the leftmost incomplete image opener (so nested `[` inside alt is stripped,
  // not treated as a link to strip under text-only mode):
  // `![img [text` → `![img text](imagePh)` even with linkMode: 'text-only'.
  if (opts.images) {
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== '[' || isPosInFence(text, i)) continue
      if (!(i > 0 && text[i - 1] === '!')) continue
      let depth = 1
      let close = -1
      for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '[') depth++
        else if (text[j] === ']') {
          depth--
          if (depth === 0) {
            close = j
            break
          }
        }
      }
      if (close === -1) {
        const before = text.slice(0, i - 1)
        // Keep complete nested `[…]` pairs; only strip unclosed `[` (`![img [text` → `![img text]`).
        const alt = stripUnclosedBrackets(text.slice(i + 1))
        return `${before}![${alt}](${opts.imagePh})`
      }
      if (close === text.length - 1 || text[close + 1] !== '(') {
        if (text.slice(close + 1).trim() === '') {
          const alt = stripUnclosedBrackets(text.slice(i + 1, close))
          return `${text.slice(0, i - 1)}![${alt}](${opts.imagePh})`
        }
      }
    }
  }

  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] !== '[' || isPosInFence(text, i)) continue
    const isImage = i > 0 && text[i - 1] === '!'
    if (isImage) continue // handled above
    if (!opts.links) continue
    let depth = 1
    let close = -1
    for (let j = i + 1; j < text.length; j++) {
      if (text[j] === '[') depth++
      else if (text[j] === ']') {
        depth--
        if (depth === 0) {
          close = j
          break
        }
      }
    }
    if (close === -1) {
      if (opts.linkMode === 'text-only') {
        // Nested: `[a [b [c` → strip every unclosed `[`.
        let out = ''
        const opens: number[] = []
        for (let k = 0; k < text.length; k++) {
          if (text[k] === '[') opens.push(out.length)
          else if (text[k] === ']' && opens.length) opens.pop()
          out += text[k]
        }
        for (let oi = opens.length - 1; oi >= 0; oi--) {
          out = out.slice(0, opens[oi]) + out.slice(opens[oi] + 1)
        }
        return out
      }
      // Incomplete reference-style `[text][` → collapse to a protocol link on the
      // label: `[text](ph)` (SPEC), not `[text][](ph)`.
      if (i > 0 && text[i - 1] === ']') {
        let depth = 1
        let labelOpen = -1
        for (let k = i - 2; k >= 0; k--) {
          if (text[k] === ']') depth++
          else if (text[k] === '[') {
            depth--
            if (depth === 0) {
              labelOpen = k
              break
            }
          }
        }
        if (labelOpen >= 0) {
          const label = text.slice(labelOpen + 1, i - 1)
          const before = text.slice(0, labelOpen)
          // Skip footnote refs `[^1]` — leave alone
          if (!label.startsWith('^')) {
            return `${before}[${label}](${opts.linkPh})`
          }
        }
      }
      return `${text}](${opts.linkPh})`
    }
  }
  return text
}

/** O(n) fence check for a position */
function isPosInFence(text: string, pos: number): boolean {
  let fence = false
  let i = 0
  while (i < pos) {
    if (i === 0 || text[i - 1] === '\n') {
      let j = i
      while (j < text.length && (text[j] === ' ' || text[j] === '\t')) j++
      const ch = text[j]
      if (ch === '`' || ch === '~') {
        let n = 0
        while (j + n < text.length && text[j + n] === ch) n++
        if (n >= 3) {
          fence = !fence
          while (i < text.length && text[i] !== '\n') i++
          if (i < text.length) i++
          continue
        }
      }
    }
    i++
  }
  return fence
}

function applySetextGuard(text: string): string {
  const lastNl = text.lastIndexOf('\n')
  if (lastNl === -1) return text
  const last = text.slice(lastNl + 1)
  const t = last.trim()
  if (!/^(-{1,2}|={1,2})$/.test(t)) return text
  if (/\s$/.test(last) && last !== t) return text
  const prevBlock = text.slice(0, lastNl)
  const pNl = prevBlock.lastIndexOf('\n')
  const prev = (pNl === -1 ? prevBlock : prevBlock.slice(pNl + 1)).trim()
  if (!prev) return text
  if (prev === '---' || /^[A-Za-z_][\w.-]*\s*:/.test(prev)) return text
  return text + '\u200B'
}

/**
 * True when a single `~` at `i` is one half of a paired open/close span like `H~2~o`
 * (word~content~word). Those are intentional subscript-style markers, not mid-word
 * tildes that need escaping.
 */
/**
 * True when `~` at `i` is part of a tight open/close pair like `H~2~o`:
 *   word ~ content ~ word
 * with no spaces/newlines/`~~` between the two single tildes.
 * Mid-word orphans like `20~25` or `a~b c~d` are not pairs.
 */
function isPairedSingleTilde(text: string, i: number): boolean {
  const isSingleTildeAt = (j: number): boolean => {
    if (text[j] !== '~') return false
    const p = j > 0 ? text[j - 1] : ''
    const n = j + 1 < text.length ? text[j + 1] : ''
    return p !== '~' && n !== '~'
  }

  // Subscript-style pair only: content between the two single tildes is pure digits
  // (`H~2~o`). Letter paths (`foo~bar~baz`) and ranges (`20~25`) are NOT pairs.
  const digitsBetween = (from: number, to: number): boolean => {
    if (to - from < 1) return false
    for (let k = from; k < to; k++) {
      const c = text[k]
      if (c < '0' || c > '9') return false
    }
    return true
  }

  // Match closer looking back to opener
  for (let j = i - 1; j >= 0; j--) {
    if (text[j] === '\n') break
    if (text[j] === '~') {
      if (!isSingleTildeAt(j)) return false
      const openPrev = codePointBefore(text, j)
      if (!isWord(openPrev)) return false
      const closeNext = codePointAt(text, i + 1)
      if (!isWord(closeNext)) return false
      return digitsBetween(j + 1, i)
    }
  }

  // Match opener looking forward to closer
  for (let j = i + 1; j < text.length; j++) {
    if (text[j] === '\n') break
    if (text[j] === '~') {
      if (!isSingleTildeAt(j)) return false
      const openPrev = codePointBefore(text, i)
      if (!isWord(openPrev)) return false
      const closeNext = codePointAt(text, j + 1)
      if (!isWord(closeNext)) return false
      return digitsBetween(i + 1, j)
    }
  }

  return false
}

/**
 * Whether `$` at `i` should open inline math.
 * Rejects currency (`$100`, `($5)`) and component name markers (`::$name`, `:$name`).
 */
function looksLikeInlineMathOpen(text: string, i: number): boolean {
  const next = i + 1 < text.length ? text[i + 1] : ''
  if (!next || next === ' ' || next === '\t' || next === '\n') return false
  // Currency: $ followed immediately by a digit
  if (next >= '0' && next <= '9') return false
  // Component name: :$name or ::$name — `$` after one or more colons at a fence/name boundary
  const prev = i > 0 ? text[i - 1] : ''
  if (prev === ':') return false
  return true
}

/** True when a delimiter run has closable content after it (letters/digits/punct). */
function hasClosableContentAfter(after: string): boolean {
  for (let i = 0; i < after.length; i++) {
    const c = after[i]
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') continue
    if (c === '*' || c === '_' || c === '~' || c === '`') continue
    return true
  }
  return false
}
