// BASED ON https://github.com/serkodev/markdown-exit/blob/fe1351070a5841426223ab4a0a5c7874ba2b1257/packages/markdown-exit/src/parser/block/rules/html_block.ts

import type { StateBlock } from 'markdown-exit'
import block_names from './html_blocks.ts'
import { HTML_OPEN_CLOSE_TAG_RE } from './html_re.ts'

// An array of opening and corresponding closing sequences for html tags,
// last argument defines whether it can terminate a paragraph or not
//
const HTML_SEQUENCES: [RegExp, RegExp, boolean][] = [
  [new RegExp(`${HTML_OPEN_CLOSE_TAG_RE.source}\\s*$`), /^<\/[^>]+>$/, true],
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

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) return false

  if (state.src.charCodeAt(pos) !== 0x3c /* < */) return false

  let lineText = state.src.slice(pos, max)

  let i = 0
  for (; i < HTML_SEQUENCES.length; i++) {
    if (HTML_SEQUENCES[i][0].test(lineText)) break
  }

  if (i === HTML_SEQUENCES.length) return false

  if (silent) {
    // true if this sequence can be a terminator, false otherwise
    return HTML_SEQUENCES[i][2]
  }

  let nextLine = startLine + 1

  // If we are here - we detected HTML block.
  // Let's roll down till block end.
  if (i !== 0 && !HTML_SEQUENCES[i][1].test(lineText)) {
    for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) {
        break
      }

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

  const token = lineText.startsWith('</') ? state.push('html_block_close', '', -1) : state.push('html_block', '', 1)
  token.map = [startLine, nextLine]
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true)

  return true
}
