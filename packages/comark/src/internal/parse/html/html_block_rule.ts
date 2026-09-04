// Standard CommonMark html_block rule — see
// https://spec.commonmark.org/0.30/#html-blocks
//
// 7 sequences in priority order, each: [opener regex, closer regex, can-terminate-paragraph]
//
// Blank-line terminated HTML (CommonMark types 6/7) already allows markdown in
// the body after `\n\n`. The `markdown` option only changes tight incomplete
// openers (no closer before EOF, no blank line): with `markdown: true` (default)
// the body is left for markdown; with `markdown: false` the block stays raw.

import type { StateBlock } from 'markdown-exit'
import block_names from './html_blocks.ts'
import { HTML_OPEN_CLOSE_TAG_RE } from './html_re.ts'

const HTML_SEQUENCES: [RegExp, RegExp, boolean][] = [
  [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, true],
  [/^<!--/, /-->/, true],
  [/^<\?/, /\?>/, true],
  [/^<![A-Z]/, />/, true],
  [/^<!\[CDATA\[/, /\]\]>/, true],
  [new RegExp(`^</?(${block_names.join('|')})(?=(\\s|/?>|$))`, 'i'), /^$/, true],
  [new RegExp(`${HTML_OPEN_CLOSE_TAG_RE.source}\\s*$`), /^$/, false],
]

/** Open tag name when `line` is a lone start tag (`<foo>` / `<foo attr>`), else null. */
function loneOpenTagName(line: string): string | null {
  const trimmed = line.trim()
  // Closing tags, void self-closers, comments, declarations — not incomplete openers.
  if (!trimmed.startsWith('<') || trimmed.startsWith('</') || trimmed.startsWith('<!')) return null
  if (/\/\s*>\s*$/.test(trimmed)) return null
  const match = trimmed.match(/^<([a-zA-Z][\w:-]*)(?:\s[^>]*)?>\s*$/)
  return match ? match[1] : null
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export interface HtmlBlockRuleOptions {
  /**
   * When true, incomplete lone open tags (no closer before EOF) leave the body
   * for markdown tokenization. When false, they stay CommonMark-raw until a
   * blank line (markdown only after `\n\n`).
   * @default true
   */
  markdown?: boolean
}

export default function createHtmlBlockRule(options: HtmlBlockRuleOptions = {}) {
  const allowIncompleteMarkdown = options.markdown !== false

  return function html_block(state: StateBlock, startLine: number, endLine: number, silent: boolean) {
    let pos = state.bMarks[startLine] + state.tShift[startLine]
    let max = state.eMarks[startLine]

    if (state.sCount[startLine] - state.blkIndent >= 4) return false
    if (state.src.charCodeAt(pos) !== 0x3c /* < */) return false

    let lineText = state.src.slice(pos, max)

    let i = 0
    for (; i < HTML_SEQUENCES.length; i++) {
      if (HTML_SEQUENCES[i][0].test(lineText)) break
    }
    if (i === HTML_SEQUENCES.length) return false

    if (silent) return HTML_SEQUENCES[i][2]

    let nextLine = startLine + 1

    // Sequences whose end condition is a blank line (type 6 block tags, type 7
    // generic tags). A lone open tag with no matching closer before EOF is an
    // incomplete streaming opener — only consume the opener line so following
    // markdown can be tokenized and absorbed by the token processor (when
    // `markdown` is enabled).
    const blankLineTerminated = HTML_SEQUENCES[i][1].source === '^$'
    const openerTag = blankLineTerminated ? loneOpenTagName(lineText) : null

    // Walk forward until the closer regex matches or we hit a blank line.
    if (!HTML_SEQUENCES[i][1].test(lineText)) {
      let sawMatchingClose = false
      for (; nextLine < endLine; nextLine++) {
        if (state.sCount[nextLine] < state.blkIndent) break

        pos = state.bMarks[nextLine] + state.tShift[nextLine]
        max = state.eMarks[nextLine]
        lineText = state.src.slice(pos, max)

        if (openerTag && new RegExp(`^</\\s*${escapeRegExp(openerTag)}\\s*>\\s*$`, 'i').test(lineText.trim())) {
          sawMatchingClose = true
        }

        if (HTML_SEQUENCES[i][1].test(lineText)) {
          if (lineText.length !== 0) nextLine++
          break
        }
      }

      // Incomplete open tag running to EOF with no closer: leave body for markdown
      // (opt-in; `markdown: false` keeps CommonMark raw until blank line / EOF).
      if (allowIncompleteMarkdown && openerTag && !sawMatchingClose && nextLine >= endLine) {
        nextLine = startLine + 1
      }
    }

    state.line = nextLine
    const token = state.push('html_block', '', 1)
    token.map = [startLine, nextLine]
    token.content = state.getLines(startLine, nextLine, state.blkIndent, true)

    return true
  }
}
