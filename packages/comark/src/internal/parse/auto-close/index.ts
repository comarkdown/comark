/**
 * Auto-closes unclosed markdown and Comark component syntax.
 *
 * Two O(n) passes, no backtracking:
 *
 *   1. `scanBlocks` — one walk over the document on offsets only (no per-line
 *      strings): fences, raw HTML, frontmatter, block math, component stack,
 *      trailing table, and the range eligible for inline healing (the last
 *      soft-wrapped paragraph).
 *   2. `healRegion` — one walk over that range with a single delimiter stack.
 *      Unclosed frames are closed LIFO at EOF; edits (tilde escapes, dropped
 *      brackets) are collected as positions and applied once at the end, so the
 *      common "nothing to escape" path never copies the string.
 *
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

/** Resolved options — every flag settled once, so the hot loops only read booleans. */
interface Opts {
  frontmatter: boolean
  syntax: boolean
  attributes: boolean
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
  tables: boolean
}

export function autoCloseMarkdown(markdown: string, options: AutoCloseOptions = {}): string {
  if (!markdown) return markdown

  const math = options.math === true
  const syntax = options.syntax !== false
  const o: Opts = {
    frontmatter: options.frontmatter === true,
    syntax,
    attributes: options.attributes ?? syntax,
    linkMode: options.linkMode ?? 'protocol',
    linkPh: options.incompleteLinkPlaceholder ?? INCOMPLETE_LINK_PLACEHOLDER,
    imagePh: options.incompleteImagePlaceholder ?? INCOMPLETE_IMAGE_PLACEHOLDER,
    blockMath: options.blockMath ?? math,
    inlineMath: options.inlineMath ?? math,
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
    tables: options.tables !== false,
  }

  const source = options.dropTrailingOpeners === true ? dropTrailingOpeners(markdown, o.inlineCode) : markdown
  const doc = scanBlocks(source, o)

  let result: string
  if (doc.start < 0) {
    result = doc.docEnd === source.length ? source : source.slice(0, doc.docEnd)
  } else {
    result =
      source.slice(0, doc.start) + healRegion(source.slice(doc.start, doc.end), o) + source.slice(doc.end, doc.docEnd)
  }

  result = applySetextGuard(result)

  if (o.tables && doc.table) result = closeTables(result)

  if (o.blockMath && doc.mathOpen) result += result.endsWith('\n') ? '$$' : '\n$$'

  if (doc.fmOpen && doc.fmContent) result = closeDelimiterLine(result, '-', 3)

  if (o.syntax) result = closeComponents(result, source, doc.comps)

  return result
}

// ---------------------------------------------------------------------------
// Block pass
// ---------------------------------------------------------------------------

interface Component {
  depth: number
  indent: string
  yaml: boolean
}

interface DocState {
  /** Offsets of the region to heal, or `start < 0` for "nothing to heal". */
  start: number
  end: number
  /** Effective document end — a trailing bare `::` is dropped. */
  docEnd: number
  fmOpen: boolean
  fmContent: boolean
  mathOpen: boolean
  /** The document ends inside a table block. */
  table: boolean
  comps: Component[]
}

const RAW_TEXT_OPEN_RE = /^<(script|pre|style|textarea)(\s|>|$)/i
const RAW_TEXT_CLOSE_RE = {
  script: /<\/script\s*>/i,
  pre: /<\/pre\s*>/i,
  style: /<\/style\s*>/i,
  textarea: /<\/textarea\s*>/i,
} as const

type RawTag = keyof typeof RAW_TEXT_CLOSE_RE

/**
 * One walk over the document, on offsets only: no per-line strings, so a long
 * streaming document costs a single scan plus one slice of the healed region.
 *
 * Every line is examined as three offsets: `ls` (start), `st`…`en` (the trimmed
 * content) and `le` (end, before the newline).
 */
function scanBlocks(src: string, o: Opts): DocState {
  const len = src.length
  const starts: number[] = [0]
  for (let i = src.indexOf('\n'); i !== -1; i = src.indexOf('\n', i + 1)) starts.push(i + 1)
  let n = starts.length
  let docEnd = len

  const comps: Component[] = []
  let fenceLen = 0
  let fenceCh = 0
  let raw: RawTag | null = null
  let fmOpen = false
  let fmContent = false
  let mathOpen = false
  let table = false
  let shielded = -1 // last line that structurally shields what precedes it

  for (let i = 0; i < n; i++) {
    const ls = starts[i]
    const le = i + 1 < n ? starts[i + 1] - 1 : len
    let st = ls
    while (st < le && isIndentCode(src.charCodeAt(st))) st++
    let en = le
    while (en > st && isSpaceCode(src.charCodeAt(en - 1))) en--
    const c0 = st < en ? src.charCodeAt(st) : -1

    if (raw !== null) {
      if (RAW_TEXT_CLOSE_RE[raw].test(src.slice(ls, le))) raw = null
      continue
    }
    if (c0 === 60 /* < */) {
      const m = RAW_TEXT_OPEN_RE.exec(src.slice(st, en))
      if (m !== null) {
        const tag = m[1].toLowerCase() as RawTag
        if (!RAW_TEXT_CLOSE_RE[tag].test(src.slice(ls, le))) raw = tag
        continue
      }
    }

    if (c0 === 96 /* ` */ || c0 === 126 /* ~ */) {
      let run = 1
      while (st + run < en && src.charCodeAt(st + run) === c0) run++
      if (run >= 3) {
        if (fenceLen === 0) {
          // `` ```code`` `` is an incomplete inline code span, not a fence opener.
          if (!(c0 === 96 && isIncompleteInlineFence(src, st, en))) {
            fenceLen = run
            fenceCh = c0
            shielded = i
            continue
          }
        } else if (c0 === fenceCh && run >= fenceLen && st + run === en) {
          // A closer is the same character, at least as long, and followed only by
          // whitespace. `` ```js `` inside an open block is code content, not a closer.
          fenceLen = 0
          shielded = i
          continue
        } else {
          shielded = i
          continue
        }
      }
    }
    if (fenceLen !== 0) continue

    if (c0 === 36 /* $ */ && en - st === 2 && src.charCodeAt(st + 1) === 36) {
      if (o.blockMath) mathOpen = !mathOpen
      shielded = i
      continue
    }

    const dashes = c0 === 45 /* - */ && en - st === 3 && src.charCodeAt(st + 1) === 45 && src.charCodeAt(st + 2) === 45

    if (i === 0 && o.frontmatter && dashes) {
      fmOpen = true
      continue
    }
    if (fmOpen) {
      if (dashes) fmOpen = false
      else if (c0 !== -1) fmContent = true
      continue
    }

    if (dashes && comps.length > 0) {
      const top = comps[comps.length - 1]
      top.yaml = !top.yaml
      continue
    }

    table = c0 === 124 /* | */

    if (o.syntax && c0 === 58 /* : */) {
      let colons = 1
      while (st + colons < en && src.charCodeAt(st + colons) === 58) colons++
      const bare = st + colons === en
      if (bare && i === n - 1 && comps.length === 0) {
        // Trailing bare `::` — drop it so it does not flash as text.
        docEnd = ls
        n--
        break
      }
      if (colons >= 2) {
        if (!bare && isNameStart(src.charCodeAt(st + colons))) {
          comps.push({ depth: colons, indent: src.slice(ls, st), yaml: false })
        } else if (bare && comps.length > 0 && comps[comps.length - 1].depth === colons) {
          comps.pop()
        }
      }
    }
  }

  const doc: DocState = { start: -1, end: -1, docEnd, fmOpen, fmContent, mathOpen, table, comps }

  // Nothing is healed while a shielded region is still open at EOF.
  if (fenceLen !== 0 || raw !== null || fmOpen || mathOpen) return doc

  const lineEnd = (i: number) => (i + 1 < n ? starts[i + 1] - 1 : docEnd)

  let e = n - 1
  while (e > 0 && lineEnd(e) === starts[e]) e--

  // A half-typed list item at the end of a list is a marker with no content yet
  // (`- item\n- ` → `- item`). Only inside a list — under a paragraph the same line
  // is a setext candidate and gets the U+200B guard instead.
  while (
    e > shielded + 1 &&
    isEmptyListItem(src, starts[e], lineEnd(e)) &&
    isListItem(src, starts[e - 1], lineEnd(e - 1))
  ) {
    docEnd = starts[e] - 1 // drop the line and the newline before it
    n = e
    e--
    while (e > 0 && lineEnd(e) === starts[e]) e--
  }
  doc.docEnd = docEnd

  if (lineEnd(e) === starts[e] || e <= shielded) return doc

  // Widen to the soft-wrapped paragraph: stop at a blank line or a new block.
  let s = e
  while (s > shielded + 1 && lineEnd(s - 1) !== starts[s - 1] && !isBlockStart(src, starts[s], lineEnd(s))) s--
  if (s !== e) {
    let join = !isBlockStart(src, starts[s], lineEnd(s)) || isListItem(src, starts[s], lineEnd(s))
    for (let i = s + 1; join && i <= e; i++) if (isBlockStart(src, starts[i], lineEnd(i))) join = false
    if (!join) s = e
  }

  // Indented code is literal.
  if (s === e && isIndentedCode(src, starts[e], lineEnd(e)) && !isListItem(src, starts[e], lineEnd(e))) return doc

  doc.start = starts[s]
  doc.end = lineEnd(e)
  return doc
}

/** `` ```python code`` `` — a code span that merely looks like a fence. */
function isIncompleteInlineFence(src: string, st: number, en: number): boolean {
  if (en - st < 5) return false
  if (src.charCodeAt(en - 1) !== 96 || src.charCodeAt(en - 2) !== 96 || src.charCodeAt(en - 3) === 96) return false
  return !src.slice(st + 3, en).includes('```')
}

const ATX_HEADING_RE = /^#{1,6}(\s|$)/
const THEMATIC_BREAK_RE = /^(\*{3,}|_{3,}|-{3,})\s*$/
const ORDERED_LIST_RE = /^\d{1,9}[.)](\s|$)/

function isIndentCode(c: number): boolean {
  return c === 32 || c === 9
}

/** True when a line opens a new block, so paragraph joining must not cross it. */
function isBlockStart(src: string, ls: number, le: number): boolean {
  if (ls >= le) return false
  if (isIndentedCode(src, ls, le)) return true
  let st = ls
  while (st < le && isIndentCode(src.charCodeAt(st))) st++
  if (st >= le) return false
  const c = src.charCodeAt(st)
  if (c === 96 || c === 126) {
    let run = 1
    while (st + run < le && src.charCodeAt(st + run) === c) run++
    if (run >= 3) return true
  }
  if (c === 35 /* # */) return ATX_HEADING_RE.test(src.slice(st, le))
  if (c === 62 /* > */ || c === 124 /* | */) return true
  if ((c === 42 || c === 95 || c === 45) && THEMATIC_BREAK_RE.test(src.slice(st, le))) return true
  return isListItem(src, st, le)
}

/** CommonMark indented code: ≥ 4 leading spaces (or a tab) plus content. */
function isIndentedCode(src: string, ls: number, le: number): boolean {
  if (ls >= le) return false
  if (src.charCodeAt(ls) === 9) return true
  let i = ls
  while (i < le && src.charCodeAt(i) === 32) i++
  return i - ls >= 4 && i < le
}

function isListItem(src: string, ls: number, le: number): boolean {
  let st = ls
  while (st < le && isIndentCode(src.charCodeAt(st))) st++
  if (st >= le) return false
  const c = src.charCodeAt(st)
  if (c === 45 || c === 43 || c === 42) {
    const c1 = st + 1 < le ? src.charCodeAt(st + 1) : -1
    return c1 === 32 || c1 === 9
  }
  return c >= 48 && c <= 57 && ORDERED_LIST_RE.test(src.slice(st, le))
}

/** A list marker with nothing after it: `-`, `- `, `1.`, `2) ` — but not `- x` or `---`. */
function isEmptyListItem(src: string, ls: number, le: number): boolean {
  let st = ls
  while (st < le && isIndentCode(src.charCodeAt(st))) st++
  let en = le
  while (en > st && isSpaceCode(src.charCodeAt(en - 1))) en--
  if (st >= en) return false
  const c = src.charCodeAt(st)
  if (c === 45 || c === 43 || c === 42) return st + 1 === en
  let i = st
  while (i < en && src.charCodeAt(i) >= 48 && src.charCodeAt(i) <= 57) i++
  if (i === st || i === en) return false
  const mark = src.charCodeAt(i)
  return (mark === 46 /* . */ || mark === 41) /* ) */ && i + 1 === en
}

function isNameStart(c: number): boolean {
  return (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || c === 36 /* $ */
}

// ---------------------------------------------------------------------------
// Inline pass
// ---------------------------------------------------------------------------

const F_STAR = 1
const F_UNDER = 2
const F_TILDE = 3
const F_CODE = 4
const F_MATH = 5
const F_LINK = 6

/** An open construct. `len` is the delimiter run still to be closed. */
interface Frame {
  k: number
  len: number
  pos: number
}

type Edit = [pos: number, replacement: string]

const LIST_COMPARE_PREFIX_RE = /^\s*(?:[-*+]|\d+[.)]) +$/
const LIST_COMPARE_VALUE_RE = /^=?\s*\$?\d/

/**
 * Heals one paragraph-sized region: closes every construct still open at EOF,
 * escapes mid-word tildes and list comparison operators, drops an incomplete
 * HTML tag, and completes an incomplete link or image.
 */
function healRegion(text: string, o: Opts): string {
  let len = text.length
  // One trailing space is streaming noise; two are a hard line break.
  if (text.charCodeAt(len - 1) === 32 && text.charCodeAt(len - 2) !== 32) len--
  if (len === 0) return ''

  const frames: Frame[] = []
  let edits: Edit[] | null = null

  let lineStart = 0
  let escEnd = -1 // index just past the last escape sequence
  let attr = 0
  let htmlLt = -1
  let starInWord = false
  let starDisabled = false

  for (let i = 0; i < len; i++) {
    const c = text.charCodeAt(i)
    const top = frames.length === 0 ? null : frames[frames.length - 1]

    if (c === 10 /* \n */) {
      lineStart = i + 1
      starInWord = false
      htmlLt = -1
      continue
    }

    // A code span shields everything but its own closer.
    if (top !== null && top.k === F_CODE) {
      if (c === 96) {
        let n = 1
        while (text.charCodeAt(i + n) === 96) n++
        if (n >= top.len) frames.pop()
        else if (i + n === len) top.len -= n
        i += n - 1
      }
      continue
    }

    if (c === 32 || c === 9 || c === 13) {
      starInWord = false
      continue
    }
    if (c === 92 /* \ */) {
      i++
      escEnd = i + 1
      continue
    }
    if (attr > 0) {
      if (c === 125 /* } */) attr--
      continue
    }
    if (htmlLt >= 0) {
      if (c === 62 /* > */) htmlLt = -1
      continue
    }

    if (c === 96 /* ` */) {
      let n = 1
      while (text.charCodeAt(i + n) === 96) n++
      const after = i + n < len ? text.charCodeAt(i + n) : -1
      if (o.inlineCode && after !== -1 && after !== 10) frames.push({ k: F_CODE, len: n, pos: i })
      i += n - 1
      continue
    }

    if (c === 36 /* $ */) {
      let n = 1
      while (text.charCodeAt(i + n) === 36) n++
      if (top !== null && top.k === F_MATH) {
        if (n >= top.len) frames.pop()
        else if (i + n === len) top.len -= n
      } else {
        const after = i + n < len ? text.charCodeAt(i + n) : -1
        if (n === 1) {
          // `$50` is currency and `::$name` is a component name, not math.
          const attached = after > 13 && after !== 32
          if (o.inlineMath && attached && !(after >= 48 && after <= 57) && text.charCodeAt(i - 1) !== 58)
            frames.push({ k: F_MATH, len: 1, pos: i })
        } else if (n === 2 && o.blockMath) {
          // `$$` may be padded (`$$ x + y $$`); only EOL/EOF means "not an opener".
          if (after !== -1 && after !== 10 && after !== 13) frames.push({ k: F_MATH, len: 2, pos: i })
        }
      }
      i += n - 1
      continue
    }

    // Inside math only code spans and the math closer are syntax.
    if (top !== null && top.k === F_MATH) continue

    if (c === 42 /* * */ || c === 95 /* _ */) {
      let n = 1
      while (text.charCodeAt(i + n) === c) n++
      const prev = codePointBefore(text, i)
      const next = i + n < len ? codePointAt(text, i + n) : ''
      const attachedLeft = prev !== '' && !isSpaceCp(prev) && i !== escEnd
      // `_` only opens at a boundary: whitespace, an escape or another marker.
      // That keeps `func(_arg` literal while `**_text` and `\___bold` still open.
      const openLeft = !attachedLeft || (c === 95 && (prev === '*' || prev === '_' || prev === '~'))
      const openRight = next !== '' && !isSpaceCp(next)
      const enabled = n === 1 ? o.italic : n === 2 ? o.bold : o.boldItalic

      if (c === 42) {
        // Word-internal `*` only counts once the word already holds a delimiter
        // (`*foo*bar*baz` pairs up, `abc*123` stays literal).
        const inWord = attachedLeft && isAlnum(prev) && isAlnum(next)
        if (!inWord || starInWord) {
          if (attachedLeft && top !== null && top.k === F_STAR && (!inWord || top.len === n)) {
            closeRun(frames, F_STAR, n)
            starInWord = true
            i += n - 1
            continue
          }
          if (openRight && enabled) {
            frames.push({ k: F_STAR, len: n, pos: i })
            starInWord = true
            i += n - 1
            continue
          }
          if (openRight && n === 1) starDisabled = true
        }
      } else {
        // `_` closes only against a non-word on the right, so `snake_case` and
        // `some__field` stay literal mid-word.
        if (attachedLeft && !isAlnum(next) && top !== null && top.k === F_UNDER) {
          closeRun(frames, F_UNDER, n)
          i += n - 1
          continue
        }
        if (openLeft && openRight && enabled) frames.push({ k: F_UNDER, len: n, pos: i })
      }
      i += n - 1
      continue
    }

    if (c === 126 /* ~ */) {
      let n = 1
      while (text.charCodeAt(i + n) === 126) n++
      const prev = codePointBefore(text, i)
      const next = i + n < len ? codePointAt(text, i + n) : ''
      const attachedLeft = prev !== '' && !isSpaceCp(prev)
      if (top !== null && top.k === F_TILDE && attachedLeft) {
        closeRun(frames, F_TILDE, n)
      } else if (n === 2 && o.strikethrough && next !== '' && !isSpaceCp(next)) {
        frames.push({ k: F_TILDE, len: 2, pos: i })
      } else if (n === 1 && o.singleTilde && isAlnum(prev) && isAlnum(next) && !isSubscriptTilde(text, i)) {
        // A lone mid-word `~` would become GFM strikethrough — keep it literal.
        edits = push(edits, [i, '\\~'])
      }
      i += n - 1
      continue
    }

    if (c === 91 /* [ */) {
      const image = text.charCodeAt(i - 1) === 33 /* ! */
      if (image ? o.images : o.links) frames.push({ k: F_LINK, len: image ? 2 : 1, pos: image ? i - 1 : i })
      continue
    }

    if (c === 93 /* ] */) {
      let b = frames.length - 1
      while (b >= 0 && frames[b].k !== F_LINK) b--
      if (b < 0) continue
      const label = frames[b]
      frames.length = b // the label closed: markers opened inside it stay literal
      const after = i + 1 < len ? text.charCodeAt(i + 1) : -1

      if (after === 40 /* ( */) {
        const end = scanDestination(text, i + 2, len)
        if (end > 0) {
          i = end // complete `[text](url)`
          continue
        }
        if (end < 0) continue // spaces inside: not a destination, keep scanning
      } else if (after === 91 /* [ */) {
        let j = i + 2
        while (j < len && text.charCodeAt(j) !== 93) j++
        if (j < len) {
          i = j // complete `[text][ref]`
          continue
        }
      } else if (!(label.len === 2 && i + 1 === len && hasContent(text, label.pos + 2, i))) {
        continue // `[text]` may be a shortcut reference; only images are healed
      }

      // Incomplete destination / reference: the link wins over everything inside.
      if (label.len === 2 || o.linkMode === 'protocol') {
        return apply(text, edits, i + 1, '(' + (label.len === 2 ? o.imagePh : o.linkPh) + ')')
      }
      return apply(text, push(edits, [label.pos, '']), i, '')
    }

    if (c === 60 /* < */) {
      const next = text.charCodeAt(i + 1)
      if (next === 47 /* / */ || isAsciiAlpha(next)) htmlLt = i
      continue
    }

    if (c === 62 /* > */) {
      if (
        o.comparisonOperators &&
        LIST_COMPARE_PREFIX_RE.test(text.slice(lineStart, i)) &&
        LIST_COMPARE_VALUE_RE.test(text.slice(i + 1))
      ) {
        edits = push(edits, [i, '\\>'])
      }
      continue
    }

    if (c === 123 /* { */ && o.attributes) {
      // Only an attached `{` is an attribute scope (`text{.cls`), never a bare line.
      const prev = text.charCodeAt(i - 1)
      if (i > 0 && prev !== 32 && prev !== 9 && prev !== 10) attr++
      continue
    }
  }

  let end = len

  // Incomplete HTML tag at EOF, plus the whitespace in front of it.
  if (htmlLt >= 0 && o.htmlTags) {
    end = htmlLt
    while (end > 0 && (text.charCodeAt(end - 1) === 32 || text.charCodeAt(end - 1) === 9)) end--
    while (frames.length > 0 && frames[frames.length - 1].pos >= htmlLt) frames.pop()
  }

  // Unclosed `[` / `![` at EOF. An empty label is a half-typed marker, not a link:
  // there is nothing to wrap, so `hello [` stays literal.
  let b = frames.length - 1
  while (b >= 0 && frames[b].k !== F_LINK) b--
  if (b >= 0 && hasContent(text, frames[b].pos + frames[b].len, end)) {
    const label = frames[b]
    if (label.len === 2 || o.linkMode === 'protocol') {
      return apply(text, edits, end, '](' + (label.len === 2 ? o.imagePh : o.linkPh) + ')')
    }
    // text-only: unwrap link labels from the inside out, stop at an image.
    for (let k = frames.length - 1; k >= 0; k--) {
      const f = frames[k]
      if (f.k !== F_LINK) continue
      frames.length = k
      if (f.len === 2) return apply(text, edits, end, '](' + o.imagePh + ')')
      edits = push(edits, [f.pos, ''])
    }
  }

  return apply(text, edits, end, closers(frames, text, o, starDisabled))
}

/** Consume `n` delimiters against the open frames of `kind`, innermost first. */
function closeRun(frames: Frame[], kind: number, n: number): void {
  let m = n
  while (m > 0 && frames.length > 0) {
    const f = frames[frames.length - 1]
    if (f.k !== kind) break
    if (m >= f.len) {
      m -= f.len
      frames.pop()
    } else {
      // Partial closer: `**bold*` leaves one `*` to complete.
      f.len -= m
      m = 0
    }
  }
}

/**
 * End of an inline link destination: index of the closing `)`, `0` when the
 * destination is unterminated, `-1` when it holds whitespace (so it is not a
 * destination at all and the text must keep flowing).
 */
function scanDestination(text: string, from: number, len: number): number {
  let depth = 1
  for (let i = from; i < len; i++) {
    const c = text.charCodeAt(i)
    if (c === 92) i++
    else if (c === 40) depth++
    else if (c === 41) {
      if (--depth === 0) return i
    } else if (c === 32 || c === 9 || c === 10) return -1
  }
  return 0
}

/** LIFO closers for everything still open. */
function closers(frames: Frame[], text: string, o: Opts, starDisabled: boolean): string {
  const skipStar = starDisabled && !o.italic
  let starSum = 0
  let starCount = 0
  let innerStar = -1
  for (let i = frames.length - 1; i >= 0; i--) {
    if (frames[i].k !== F_STAR) continue
    starSum += frames[i].len
    starCount++
    if (innerStar < 0) innerStar = i
  }
  // A cross-family construct outside the innermost `*` cannot be nested through:
  // `~~strike **bold *italic` closes only the `*` (SPEC), never `***~~`.
  let crossOutside = false
  for (let i = innerStar - 1; i >= 0; i--) {
    const k = frames[i].k
    if (k === F_TILDE || k === F_UNDER || k === F_MATH) {
      crossOutside = true
      break
    }
  }

  let out = ''
  let starDone = false
  for (let i = frames.length - 1; i >= 0; i--) {
    const f = frames[i]
    switch (f.k) {
      case F_STAR:
        if (starDone || skipStar) break
        starDone = true
        out += '*'.repeat(starCount >= 2 && crossOutside ? f.len : starSum)
        break
      case F_UNDER:
        out += '_'.repeat(f.len)
        break
      case F_TILDE:
        out += '~'.repeat(f.len)
        break
      case F_CODE:
        out += '`'.repeat(f.len)
        break
      case F_MATH:
        // A `$$` block opened on an earlier line closes on its own line.
        out += f.len === 2 && text.lastIndexOf('\n') > f.pos ? '\n$$' : '$'.repeat(f.len)
        break
    }
  }
  return out
}

function push(edits: Edit[] | null, edit: Edit): Edit[] {
  if (edits === null) return [edit]
  edits.push(edit)
  return edits
}

/** `text[0, end)` with every edit applied, then `suffix`. */
function apply(text: string, edits: Edit[] | null, end: number, suffix: string): string {
  if (edits === null) return end === text.length ? (suffix === '' ? text : text + suffix) : text.slice(0, end) + suffix
  if (edits.length > 1) edits.sort(byPos)
  let out = ''
  let copied = 0
  for (let i = 0; i < edits.length; i++) {
    const [pos, replacement] = edits[i]
    if (pos >= end) break
    out += text.slice(copied, pos) + replacement
    copied = pos + 1
  }
  return out + text.slice(copied, end) + suffix
}

function byPos(a: Edit, b: Edit): number {
  return a[0] - b[0]
}

// ---------------------------------------------------------------------------
// Document-level closers
// ---------------------------------------------------------------------------

/**
 * Appends a `---` delimiter line, completing a half-typed one in place
 * (`title: x\n-` → `title: x\n---`).
 */
function closeDelimiterLine(text: string, ch: string, width: number): string {
  const last = text
    .slice(text.lastIndexOf('\n') + 1)
    .trim()
    .replace(ZWSP_RE, '')
  if (last.length > 0 && last.length < width && last === ch.repeat(last.length)) {
    return text.replace(TRAILING_ZWSP_RE, '') + ch.repeat(width - last.length)
  }
  return text + (text.endsWith('\n') ? '' : '\n') + ch.repeat(width)
}

/** Closes an open props brace and every open component fence, innermost first. */
function closeComponents(result: string, source: string, comps: Component[]): string {
  if (!source.includes('::')) return result

  // `::alert{type="info` → close the quote and the brace.
  const lineStart = result.lastIndexOf('\n') + 1
  let brace = -1
  for (let i = result.length - 1; i >= lineStart; i--) {
    const c = result.charCodeAt(i)
    if (c === 125 /* } */) break
    if (c === 123 /* { */) {
      brace = i
      break
    }
  }
  if (brace >= 0) {
    let dq = 0
    let sq = 0
    for (let i = brace + 1; i < result.length; i++) {
      const c = result.charCodeAt(i)
      if (c === 34) dq++
      else if (c === 39) sq++
    }
    result += (dq % 2 === 1 ? '"' : '') + (sq % 2 === 1 ? "'" : '') + '}'
  }

  if (comps.length === 0) return result

  const top = comps[comps.length - 1]
  if (top.yaml) {
    const last = result
      .slice(result.lastIndexOf('\n') + 1)
      .trim()
      .replace(ZWSP_RE, '')
    if (last === '-' || last === '--') {
      result = result.replace(TRAILING_ZWSP_RE, '') + '-'.repeat(3 - last.length)
      top.yaml = false
    }
  }

  let out = result
  for (let i = comps.length - 1; i >= 0; i--) {
    const c = comps[i]
    if (c.yaml) out += '\n' + c.indent + '---'
    out += '\n' + c.indent + ':'.repeat(c.depth)
  }
  return out
}

const ZWSP_RE = /\u200B/g
const TRAILING_ZWSP_RE = /\u200B+$/
const SETEXT_RE = /^(?:-{1,2}|={1,2})$/
const YAML_KEY_RE = /^[A-Za-z_][\w.-]*\s*:/

/**
 * A 1–2 char `-`/`=` line under a paragraph would flash as a setext heading
 * while the list marker or rule is still being typed — park it behind U+200B.
 */
function applySetextGuard(text: string): string {
  const lastNl = text.lastIndexOf('\n')
  if (lastNl === -1) return text
  const last = text.slice(lastNl + 1)
  const t = last.trim()
  if (!SETEXT_RE.test(t)) return text
  // Trailing whitespace other than a stripped single space means "still typing".
  if (last !== t && /\s$/.test(last)) return text
  const head = text.slice(0, lastNl)
  const prev = head.slice(head.lastIndexOf('\n') + 1).trim()
  if (prev === '' || prev === '---' || YAML_KEY_RE.test(prev)) return text
  return text + '\u200B'
}

// ---------------------------------------------------------------------------
// Trailing openers (streaming)
// ---------------------------------------------------------------------------

function isTrailingOpener(c: number): boolean {
  // * _ $ : ` ~ [ { !
  return c === 42 || c === 95 || c === 36 || c === 58 || c === 96 || c === 126 || c === 91 || c === 123 || c === 33
}

/**
 * Drops a trailing opener run at EOF unless it is attached to a word
 * (`hello *` → `hello`), so a half-typed marker never flashes. Markers with content
 * after them (`**bold`) are not trailing runs and stay for the heal; a bare `$`
 * after a word (`text123$`) is dropped anyway, being only a math opener.
 */
function dropTrailingOpeners(text: string, inlineCode: boolean): string {
  let ws = text.length
  while (ws > 0 && isSpaceCode(text.charCodeAt(ws - 1))) ws--
  if (ws === 0) return text

  let i = ws
  while (i > 0 && isTrailingOpener(text.charCodeAt(i - 1))) {
    if (text.charCodeAt(i - 2) === 92 /* \ */) break
    i--
  }
  if (i === ws) return text

  let allDollar = true
  let allTick = true
  for (let k = i; k < ws; k++) {
    const c = text.charCodeAt(k)
    if (c !== 36) allDollar = false
    if (c !== 96) allTick = false
  }
  if (allDollar && isAlnum(codePointBefore(text, i))) return text.slice(0, i) + text.slice(ws)

  // A trailing backtick run may belong to an open code span rather than start a
  // new one. Then it is the heal pass's job, not ours: it either closes the span
  // (`space `` ``) or completes a short closer (`spaces ``  ` ` → `spaces ``  ``).
  // Only a span with no content yet is dropped, opener and all.
  if (allTick && inlineCode) {
    const span = openCodeSpan(text, i)
    if (span !== null) {
      if (ws - i >= span.len) return text // a closer — leave it to the heal
      const gap = i - span.end
      const pad = gap === 1 ? text.charCodeAt(span.end) : -1
      if (gap > 1 || (gap === 1 && pad !== 32 && pad !== 9)) return text // real content
      return text.slice(0, trimBack(text, span.start)) + text.slice(ws)
    }
  }

  // Attached to a word the run is prose or a closer (`text**`, `word_`, `20~`), so it
  // stays. After whitespace or punctuation it can only be a half-typed opener
  // (`hello *`, ``escape lone `~` (` ``) and would flash.
  if (isAlnum(codePointBefore(text, i))) return text

  return text.slice(0, trimBack(text, i)) + text.slice(ws)
}

/** True when `text[from, to)` holds anything other than whitespace. */
function hasContent(text: string, from: number, to: number): boolean {
  for (let i = from; i < to; i++) if (!isSpaceCode(text.charCodeAt(i))) return true
  return false
}

/** `from`, minus one space or tab of padding before it. */
function trimBack(text: string, from: number): number {
  const prev = text.charCodeAt(from - 1)
  return prev === 32 || prev === 9 ? from - 1 : from
}

/**
 * The inline code span still open at `limit` on its line, or null. Mirrors the
 * heal pass's matching rule: a run closes the span when it is at least as long
 * as the opener, otherwise it is content.
 */
function openCodeSpan(text: string, limit: number): { start: number; len: number; end: number } | null {
  let start = -1
  let len = 0
  let end = -1
  let i = text.lastIndexOf('\n', limit - 1) + 1
  while (i < limit) {
    const c = text.charCodeAt(i)
    if (c === 92 /* \ */) {
      i += 2
      continue
    }
    if (c !== 96) {
      i++
      continue
    }
    let n = 1
    while (i + n < limit && text.charCodeAt(i + n) === 96) n++
    if (len === 0) {
      len = n
      start = i
      end = i + n
    } else if (n >= len) {
      len = 0
      start = -1
      end = -1
    }
    i += n
  }
  return len === 0 ? null : { start, len, end }
}

// ---------------------------------------------------------------------------
// Characters
// ---------------------------------------------------------------------------

const ALNUM_CP_RE = /\p{L}|\p{N}/u

/** Letter or digit. Everything else (including `_`) is CommonMark punctuation. */
function isAlnum(cp: string): boolean {
  if (cp === '') return false
  const c = cp.charCodeAt(0)
  // ASCII fast path covers nearly all markdown without a Unicode test.
  if (c <= 127) return (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122)
  return ALNUM_CP_RE.test(cp)
}

function isAsciiAlpha(c: number): boolean {
  return (c >= 97 && c <= 122) || (c >= 65 && c <= 90)
}

function isSpaceCp(cp: string): boolean {
  return cp === ' ' || cp === '\t' || cp === '\n' || cp === '\r'
}

function isSpaceCode(c: number): boolean {
  return c === 32 || c === 9 || c === 10 || c === 13
}

/** Full code point before `i` (surrogate aware), `''` at the start. */
function codePointBefore(text: string, i: number): string {
  if (i <= 0) return ''
  const c = text.charCodeAt(i - 1)
  if (c >= 0xdc00 && c <= 0xdfff && i >= 2) {
    const hi = text.charCodeAt(i - 2)
    if (hi >= 0xd800 && hi <= 0xdbff) return text.slice(i - 2, i)
  }
  return text[i - 1]
}

/** Full code point at `i` (surrogate aware). */
function codePointAt(text: string, i: number): string {
  const c = text.charCodeAt(i)
  if (c >= 0xd800 && c <= 0xdbff) {
    const lo = text.charCodeAt(i + 1)
    if (lo >= 0xdc00 && lo <= 0xdfff) return text.slice(i, i + 2)
  }
  return text[i]
}

/**
 * True for the subscript pattern `word~digits~word` (`H~2~o`), the one paired
 * use of single tildes that must stay unescaped.
 */
function isSubscriptTilde(text: string, i: number): boolean {
  for (let j = i - 1; j >= 0 && text.charCodeAt(j) !== 10; j--) {
    if (text.charCodeAt(j) === 126) return isSubscriptPair(text, j, i)
  }
  for (let j = i + 1; j < text.length && text.charCodeAt(j) !== 10; j++) {
    if (text.charCodeAt(j) === 126) return isSubscriptPair(text, i, j)
  }
  return false
}

function isSubscriptPair(text: string, open: number, close: number): boolean {
  if (close - open < 2) return false
  if (text.charCodeAt(open - 1) === 126 || text.charCodeAt(open + 1) === 126) return false
  if (text.charCodeAt(close + 1) === 126) return false
  for (let k = open + 1; k < close; k++) {
    const c = text.charCodeAt(k)
    if (c < 48 || c > 57) return false
  }
  return isAlnum(codePointBefore(text, open)) && isAlnum(codePointAt(text, close + 1))
}
