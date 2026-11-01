/**
 * HTML parsing plugin for Comark.
 *
 * Enables embedded HTML block and inline tags to be tokenized and later
 * converted into AST nodes by the token processor.
 *
 * On by default via `registerDefaultPlugins`.
 * Pass `registerDefaultPlugins: false` (and omit this plugin) to treat HTML
 * tags as plain text.
 *
 * Contract: `SPEC/HTML/README.md` (block vs inline, markdown vs literal,
 * deferred cases). Fixtures live beside it; option matrix in
 * `test/html-block.test.ts`.
 *
 * Options:
 * - `markdown` (default `true`): expand text leaves inside closed HTML
 *   fragments as inline markdown (`<h1>Hello **World**</h1>` → strong).
 *   Implemented by narrowing markdown-exit's `html_block` rule to `<style>`,
 *   `<pre>`, `<script>`, `<textarea>`, and comments (`<!--`) so the rest
 *   tokenizes as normal markdown. Their bodies are not markdown and every
 *   character between the delimiters is kept; inner tags are text, except in
 *   `<pre>` (see `SPEC/HTML/README.md`); that holds inline too (`text <pre>**x**</pre>`). When `false`, that rule stays and every closed-block
 *   body stays literal. Blank-line bodies still nest as markdown tokens via bare
 *   open/close pairing, in both modes.
 *
 * @example
 * ```ts
 * import { parseMarkdown } from 'comark'
 * import html from 'comark/plugins/html'
 *
 * // Explicit registration (also on by default via registerDefaultPlugins)
 * const result = await parseMarkdown('<strong class="bold">Hello</strong>', {
 *   plugins: [html()],
 * })
 * // → [ ['strong', { class: 'bold', $: { html: 1, block: 0 } }, 'Hello'] ]
 * ```
 */

import { type StateBlock, type StateInline, Token, type MarkdownExit } from 'markdown-exit/core'
import { decodeHTMLStrict } from '../internal/entities.ts'
import type { ComarkParseTokensState } from '../types.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { isHtmlVoidElement } from '../utils/index.ts'
import { HTML_TAG_RE } from '../internal/parse/html-tag.ts'

export interface HtmlPluginOptions {
  /**
   * Expand text leaves inside closed HTML fragments as inline markdown.
   * @default true
   */
  markdown?: boolean
}

export default defineComarkPlugin((opts: HtmlPluginOptions = {}) => {
  const markdown = opts.markdown !== false

  return {
    name: 'html',
    markdownItPlugins: [markdown ? markdownItHtmlWithMarkdown : markdownItHtmlWithoutMarkdown],
    markdownItPost: markdownItPost,
  }
})

function markdownItHtmlWithoutMarkdown(md: MarkdownExit) {
  md.set({ html: true })
  md.inline.ruler.at('html_inline', htmlInline)
}

// markdown-exit's rule with Comark's tag grammar, so inline and block scanning agree.
function htmlInline(state: StateInline, silent: boolean): boolean {
  if (!state.md.options.html) return false
  const pos = state.pos
  if (state.src.charCodeAt(pos) !== 0x3c /* < */ || pos + 2 >= state.posMax) return false
  const next = state.src.charCodeAt(pos + 1)
  if (next !== 0x21 /* ! */ && next !== 0x3f /* ? */ && next !== 0x2f /* / */ && !isLetter(next)) return false
  const match = HTML_TAG_RE.exec(state.src.slice(pos, state.posMax))
  if (!match) return false
  // `before <pre>**x**</pre>`: a raw element's body is not markdown, inline as well as in a block.
  const rawEnd = rawElementEnd(state, pos, match[0])
  if (rawEnd > 0) {
    if (!silent) {
      state.pushPending()
      for (const part of htmlToTokens(state.src.slice(pos, rawEnd))) {
        const token = state.push(part.type, '', 0)
        token.content = part.content
        token.meta = part.meta
      }
    }
    state.pos = rawEnd
    return true
  }
  if (!silent) {
    const token = state.push('html_inline', '', 0)
    token.content = match[0]
    if (/^<a[>\s]/i.test(match[0])) state.linkLevel++
    if (/^<\/a\s*>/i.test(match[0])) state.linkLevel--
  }
  state.pos += match[0].length
  return true
}

function markdownItHtmlWithMarkdown(md: MarkdownExit) {
  markdownItHtmlWithoutMarkdown(md)

  // @ts-expect-error - internal utils
  const html_block = md.block.ruler.__rules__.find((r) => r.name === 'html_block')
  const fn = html_block.fn
  html_block.fn = (state: StateBlock, startLine: number, endLine: number, silent: boolean) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    if (isRawTagBlock(state.src, pos)) return fn(state, startLine, endLine, silent)
    // A comment only opens a block where one starts; it must not interrupt a
    // paragraph (`silent` probe), or `<div>\n  <!-- x -->` would split the div body.
    if (!silent && state.src.startsWith('<!--', pos)) return fn(state, startLine, endLine, silent)
  }
}

function markdownItPost(state: ComarkParseTokensState) {
  let i = 0
  while (i < state.tokens.length) {
    const token = state.tokens[i]
    if (token.type !== 'html_block') {
      i += 1
      continue
    }

    // Expand raw CommonMark html_block into html_inline + text, wrapped as a
    // paragraph so the tree walk pairs open/close the same way as html_inline.
    // Body text stays literal (no markdown re-parse).
    // The block's own indentation is not content (`  <!-- a -->`).
    const children = htmlToTokens((token.content || '').replace(/^[ \t]+/, ''))
    const open = new Token('paragraph_open', 'p', 1)
    const inline = new Token('inline', '', 0)
    const close = new Token('paragraph_close', 'p', -1)
    // The paragraph keeps the block's container depth, so closing tags pair within it.
    open.level = close.level = token.level
    inline.level = token.level + 1
    inline.children = children
    inline.content = token.content || ''
    if (token.map) {
      open.map = token.map
      inline.map = token.map
    }
    state.tokens.splice(i, 1, open, inline, close)
    i += 3
  }
}

function isLetter(code: number): boolean {
  return (code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)
}

/** The rest of a tag name: letters, digits and `-`, so `script-x` is not `script`. */
function isNameChar(code: number): boolean {
  return isLetter(code) || (code >= 0x30 && code <= 0x39) || code === 0x2d
}

/** CommonMark type-1 raw blocks whose body is kept verbatim. `<prelude>` does not match. */
const RAW_HTML_TAGS = new Set(['style', 'pre', 'script', 'textarea'])

/** Raw blocks whose body is plain text. `<pre>` is not: its tags are HTML, only markdown is off. */
const TEXT_BODY_TAGS = new Set(['style', 'script', 'textarea'])

/** Raw blocks whose body still has character references (`textarea`, `pre`). `style` and `script` do not. */
const DECODED_BODY_TAGS = new Set(['pre', 'textarea'])

/** Read `<name` or `</name` at `pos`. `after` is the index of the first character after the name. */
function readTag(src: string, pos: number): { name: string; close: boolean; after: number } | null {
  if (src.charCodeAt(pos) !== 0x3c /* < */) return null
  let i = pos + 1
  const close = src.charCodeAt(i) === 0x2f /* / */
  if (close) i += 1
  const start = i
  if (!isLetter(src.charCodeAt(i))) return null
  while (i < src.length && isNameChar(src.charCodeAt(i))) i += 1
  return { name: src.slice(start, i).toLowerCase(), close, after: i }
}

function isTagBoundary(src: string, pos: number): boolean {
  if (pos >= src.length) return true
  const next = src.charCodeAt(pos)
  return next === 0x3e /* > */ || next === 0x2f /* / */ || next <= 0x20
}

/** True when `src` at `pos` opens a raw-tag HTML block, including attributes. */
function isRawTagBlock(src: string, pos: number): boolean {
  const tag = readTag(src, pos)
  return !!tag && !tag.close && RAW_HTML_TAGS.has(tag.name) && isTagBoundary(src, tag.after)
}

/**
 * Body text inside a closed HTML block stays literal.
 *
 * Newline-bearing runs are structural: drop whitespace-only gaps between tags
 * and strip the surrounding indent, including end-of-line padding before a
 * trailing newline. Horizontal whitespace is significant — a space between
 * inline tags (`</a> <a>`) or beside text (`Hello <em>`) must survive.
 */
function literalText(content: string): string {
  if (!/[\r\n]/.test(content)) return content

  let start = 0
  let end = content.length

  if (/^\s*[\r\n]/.test(content)) {
    const nonSpace = content.search(/\S/)
    if (nonSpace < 0) return ''
    start = nonSpace
  }

  const trailing = /[ \t]*(?:\r\n|\n|\r)[ \t]*$/.exec(content)
  if (trailing && trailing.index >= start) end = trailing.index

  return start >= end ? '' : content.slice(start, end)
}

function pushText(tokens: Token[], content: string, verbatim = false, decode = true) {
  const textContent = verbatim ? content : literalText(content)
  if (!textContent) return
  const text = new Token('text', '', 0)
  text.content = decode ? decodeHTMLStrict(textContent) : textContent
  // Decoded text can spell `<!--`; it is not a comment.
  if (decode) text.meta = { literal: true }
  tokens.push(text)
}

function pushHtml(tokens: Token[], content: string) {
  const html = new Token('html_inline', '', 0)
  html.content = content
  tokens.push(html)
}

/** End index of `</name …>`, or -1. Whitespace before `>` is allowed. */
function rawCloserEnd(src: string, pos: number, name: string): number {
  const tag = readTag(src, pos)
  if (!tag?.close || tag.name !== name) return -1
  let j = tag.after
  while (j < src.length && src.charCodeAt(j) <= 0x20) j += 1
  return src.charCodeAt(j) === 0x3e /* > */ ? j + 1 : -1
}

interface Closer {
  start: number
  end: number
}

/** Where each raw element's `</name>` sits in `src`, found in one pass on first use. */
function createCloserFinder(src: string): (from: number, name: string, limit?: number) => Closer | null {
  let index: Map<string, Closer[]> | undefined
  return (from, name, limit = src.length) => {
    if (!index) {
      index = new Map()
      for (let i = src.indexOf('<'); i >= 0; i = src.indexOf('<', i + 1)) {
        const tag = readTag(src, i)
        if (!tag?.close || !RAW_HTML_TAGS.has(tag.name)) continue
        const end = rawCloserEnd(src, i, tag.name)
        if (end < 0) continue
        const list = index.get(tag.name)
        if (list) list.push({ start: i, end })
        else index.set(tag.name, [{ start: i, end }])
      }
    }
    const list = index.get(name)
    if (!list) return null
    let lo = 0
    let hi = list.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (list[mid].start < from) lo = mid + 1
      else hi = mid
    }
    return lo < list.length && list[lo].end <= limit ? list[lo] : null
  }
}

const inlineClosers = new WeakMap<StateInline, (from: number, name: string, limit?: number) => Closer | null>()

/** End of the raw element opened by `openTag` at `pos` when its closer is before `limit`, else -1. */
function rawElementEnd(state: StateInline, pos: number, openTag: string): number {
  const raw = readTag(openTag, 0)
  if (!raw || raw.close || !RAW_HTML_TAGS.has(raw.name) || !isTagBoundary(openTag, raw.after) || openTag.endsWith('/>'))
    return -1
  let find = inlineClosers.get(state)
  if (!find) inlineClosers.set(state, (find = createCloserFinder(state.src)))
  return find(pos + openTag.length, raw.name, state.posMax)?.end ?? -1
}

/**
 * Split an HTML fragment into markdown-exit tokens.
 * Each recognized tag becomes `html_inline`; intervening runs become `text`.
 *
 * @example
 * htmlToTokens('<ai-thinking>\n**bold**')
 * // → [html_inline "<ai-thinking>", text "**bold**"]
 */
export function htmlToTokens(str: string): Token[] {
  const tokens: Token[] = []
  scan(tokens, str, false)
  return tokens
}

/** Start of the last `</name>` for each tag name in `str`, found in one pass. */
function lastClosers(str: string): Map<string, number> {
  const last = new Map<string, number>()
  for (const match of str.matchAll(/<\/([A-Za-z][A-Za-z0-9-]*)\s*>/g)) last.set(match[1].toLowerCase(), match.index)
  return last
}

/** `verbatim` keeps every character of a text run, as inside `<pre>`. */
function scan(tokens: Token[], str: string, verbatim: boolean) {
  const len = str.length
  let pos = 0
  let textStart = 0
  const closers = verbatim ? lastClosers(str) : undefined
  const findCloser = createCloserFinder(str)

  while (pos < len) {
    // Candidate HTML tag starts with '<' followed by letter, '/', '!', or '?'
    if (str.charCodeAt(pos) === 0x3c /* < */ && pos + 1 < len) {
      const next = str.charCodeAt(pos + 1)
      if (next === 0x21 /* ! */ || next === 0x3f /* ? */ || next === 0x2f /* / */ || isLetter(next)) {
        const match = HTML_TAG_RE.exec(str.slice(pos))
        if (match && !(closers && isUnpairedOpener(closers, pos + match[0].length, match[0]))) {
          if (pos > textStart) pushText(tokens, str.slice(textStart, pos), verbatim)
          const raw = readTag(match[0], 0)
          // style / pre / script / textarea: body is source until the closer, inner tags included
          // (except in `<pre>`, whose inner tags are HTML).
          if (
            raw &&
            !raw.close &&
            RAW_HTML_TAGS.has(raw.name) &&
            isTagBoundary(match[0], raw.after) &&
            match[0].charCodeAt(match[0].length - 2) !== 0x2f
          ) {
            pushHtml(tokens, match[0])
            const from = pos + match[0].length
            const closer = findCloser(from, raw.name)
            if (!closer) {
              pushRawBody(tokens, str.slice(from), raw.name)
              return
            }
            pushRawBody(tokens, str.slice(from, closer.start), raw.name)
            pushHtml(tokens, str.slice(closer.start, closer.end))
            pos = closer.end
            textStart = pos
            continue
          }
          pushHtml(tokens, match[0])
          pos += match[0].length
          textStart = pos
          continue
        }
      }
    }
    pos++
  }

  if (textStart < len) pushText(tokens, str.slice(textStart), verbatim)
}

/** In `<pre>`, `Array<string>` is code: an open tag with no closer after it stays text. */
function isUnpairedOpener(closers: Map<string, number>, end: number, tagSource: string): boolean {
  const name = /^<([A-Za-z][A-Za-z0-9-]*)/.exec(tagSource)?.[1].toLowerCase()
  if (!name || isHtmlVoidElement(name) || tagSource.endsWith('/>')) return false
  return (closers.get(name) ?? -1) < end
}

function pushRawBody(tokens: Token[], body: string, name: string) {
  if (TEXT_BODY_TAGS.has(name)) pushText(tokens, body, true, DECODED_BODY_TAGS.has(name))
  else scan(tokens, body, true)
}
