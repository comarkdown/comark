// Standard CommonMark html_block rule — see
// https://spec.commonmark.org/0.30/#html-blocks
//
// 7 sequences in priority order, each: [opener regex, closer regex, can-terminate-paragraph]

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

export default function html_block(state: StateBlock, startLine: number, endLine: number, silent: boolean) {
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

  // Walk forward until the closer regex matches or we hit a blank line.
  if (!HTML_SEQUENCES[i][1].test(lineText)) {
    for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) break

      pos = state.bMarks[nextLine] + state.tShift[nextLine]
      max = state.eMarks[nextLine]
      lineText = state.src.slice(pos, max)

      if (HTML_SEQUENCES[i][1].test(lineText)) {
        if (lineText.length !== 0) nextLine++
        break
      }
    }
  }

  state.line = nextLine
  const token = state.push('html_block', '', 1)
  token.map = [startLine, nextLine]
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true)

  return true
}
