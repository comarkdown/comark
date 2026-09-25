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
 *   `<pre>`, `<script>`, and `<textarea>` so the rest tokenizes as normal
 *   markdown. Those four stay verbatim: every character between the tags is kept,
 *   and an inner tag is text. When `false`, that rule stays and every closed-block
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

import { type StateBlock, Token, type MarkdownExit } from 'markdown-exit'
import type { ComarkParseTokensState } from '../types.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'

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
}

function markdownItHtmlWithMarkdown(md: MarkdownExit) {
  markdownItHtmlWithoutMarkdown(md)

  // @ts-expect-error - internal utils
  const html_block = md.block.ruler.__rules__.find((r) => r.name === 'html_block')
  const fn = html_block.fn
  html_block.fn = (state: StateBlock, startLine: number, endLine: number, silent: boolean) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    if (isRawHtmlBlock(state.src, pos)) return fn(state, startLine, endLine, silent)
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
    const children = htmlToTokens(token.content || '')
    const open = new Token('paragraph_open', 'p', 1)
    const inline = new Token('inline', '', 0)
    const close = new Token('paragraph_close', 'p', -1)
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

// region - https://github.com/markdown-it/markdown-it/blob/master/src/common/html_re.ts#L21

const attr_name = '[a-zA-Z_:][a-zA-Z0-9:._-]*'

const unquoted = '[^"\'=<>`\\x00-\\x20]+'
const single_quoted = "'[^']*'"
const double_quoted = '"[^"]*"'

const attr_value = `(?:${unquoted}|${single_quoted}|${double_quoted})`

const attribute = `(?:\\s+${attr_name}(?:\\s*=\\s*${attr_value})?)`

const open_tag = `<[A-Za-z][A-Za-z0-9\\-]*${attribute}*\\s*\\/?>`

const close_tag = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>'
const comment = '<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->'
const processing = '<[?][\\s\\S]*?[?]>'
const declaration = '<![A-Za-z][^>]*>'
const cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'

const HTML_TAG_RE = new RegExp(`^(?:${open_tag}|${close_tag}|${comment}|${processing}|${declaration}|${cdata})`)

// end region

function isLetter(code: number): boolean {
  return (code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)
}

/** CommonMark type-1 raw blocks whose body is kept verbatim. `<prelude>` does not match. */
const RAW_HTML_TAGS = new Set(['style', 'pre', 'script', 'textarea'])

/** Read `<name` or `</name` at `pos`. `after` is the index of the first character after the name. */
function readTag(src: string, pos: number): { name: string; close: boolean; after: number } | null {
  if (src.charCodeAt(pos) !== 0x3c /* < */) return null
  let i = pos + 1
  const close = src.charCodeAt(i) === 0x2f /* / */
  if (close) i += 1
  const start = i
  while (i < src.length && isLetter(src.charCodeAt(i))) i += 1
  if (i === start) return null
  return { name: src.slice(start, i).toLowerCase(), close, after: i }
}

function isTagBoundary(src: string, pos: number): boolean {
  if (pos >= src.length) return true
  const next = src.charCodeAt(pos)
  return next === 0x3e /* > */ || next === 0x2f /* / */ || next <= 0x20
}

/** True when `src` at `pos` opens a raw HTML block, including attributes. */
function isRawHtmlBlock(src: string, pos: number): boolean {
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

function pushText(tokens: Token[], content: string, verbatim = false) {
  const textContent = verbatim ? content : literalText(content)
  if (!textContent) return
  const text = new Token('text', '', 0)
  text.content = textContent
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
  const len = str.length
  let pos = 0
  let textStart = 0

  while (pos < len) {
    // Candidate HTML tag starts with '<' followed by letter, '/', '!', or '?'
    if (str.charCodeAt(pos) === 0x3c /* < */ && pos + 1 < len) {
      const next = str.charCodeAt(pos + 1)
      if (next === 0x21 /* ! */ || next === 0x3f /* ? */ || next === 0x2f /* / */ || isLetter(next)) {
        const match = str.slice(pos).match(HTML_TAG_RE)
        if (match) {
          if (pos > textStart) pushText(tokens, str.slice(textStart, pos))
          const raw = readTag(match[0], 0)
          // style / pre / script / textarea: body is source until the closer, inner tags included.
          if (raw && !raw.close && RAW_HTML_TAGS.has(raw.name) && match[0].charCodeAt(match[0].length - 2) !== 0x2f) {
            pushHtml(tokens, match[0])
            const from = pos + match[0].length
            let end = -1
            for (let i = from; i < len; i += 1) {
              if (str.charCodeAt(i) !== 0x3c /* < */) continue
              end = rawCloserEnd(str, i, raw.name)
              if (end < 0) continue
              pushText(tokens, str.slice(from, i), true)
              pushHtml(tokens, str.slice(i, end))
              pos = end
              break
            }
            if (end < 0) {
              pushText(tokens, str.slice(from), true)
              return tokens
            }
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

  if (textStart < len) pushText(tokens, str.slice(textStart))

  return tokens
}
