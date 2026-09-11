/**
 * Indentation shifting for a block component's children.
 *
 * A child indented less than its own `::` marker used to be dropped.
 * These helpers shift the region left instead.
 */

import type { StateBlock } from 'markdown-exit'

/**
 * Remove up to `columns` columns of indentation from `line`, in place.
 * Returns `false` when a tab spans the boundary, leaving the line untouched.
 * `bMarks` moves past the consumed characters, so offsets derived from it hold.
 */
function dedentLine(state: StateBlock, line: number, columns: number): boolean {
  const lineStart = state.bMarks[line]
  const max = state.eMarks[line]
  let pos = lineStart
  let consumed = 0

  while (pos < max && consumed < columns) {
    const code = state.src.charCodeAt(pos)
    if (code === 0x20 /* space */) {
      consumed++
    } else if (code === 0x09 /* tab */) {
      const width = 4 - ((consumed + state.bsCount[line]) % 4)
      // A tab across the boundary would have to become spaces to be split.
      if (consumed + width > columns) return false
      consumed += width
    } else {
      // Less indentation than asked for: a fence body left of its own fence.
      break
    }
    pos++
  }

  if (consumed > 0) {
    state.bMarks[line] = pos
    state.bsCount[line] += consumed
    state.sCount[line] -= consumed
    state.tShift[line] -= pos - lineStart
  }

  return true
}

/**
 * Tokenize `[from, to)` with every line dedented by its entry in `shifts`.
 * Returns `false` when a line resists the shift, leaving the region untouched.
 * All or nothing: a half-shifted region would parse as neither form.
 */
export function tokenizeDedented(state: StateBlock, from: number, to: number, shifts: number[]): boolean {
  const bMarks: number[] = []
  const bsCount: number[] = []
  const sCount: number[] = []
  const tShift: number[] = []

  for (let line = from; line < to; line++) {
    bMarks.push(state.bMarks[line])
    bsCount.push(state.bsCount[line])
    sCount.push(state.sCount[line])
    tShift.push(state.tShift[line])
    if (!dedentLine(state, line, shifts[line - from])) {
      restoreLines(state, from, bMarks, bsCount, sCount, tShift)
      return false
    }
  }

  const blkIndent = state.blkIndent
  state.blkIndent = 0
  state.md.block.tokenize(state, from, to)
  state.blkIndent = blkIndent
  restoreLines(state, from, bMarks, bsCount, sCount, tShift)

  return true
}

/** Put back the line marks saved before {@link dedentLine} shifted them. */
function restoreLines(
  state: StateBlock,
  from: number,
  bMarks: number[],
  bsCount: number[],
  sCount: number[],
  tShift: number[]
): void {
  for (let i = 0; i < bMarks.length; i++) {
    const line = from + i
    state.bMarks[line] = bMarks[i]
    state.bsCount[line] = bsCount[i]
    state.sCount[line] = sCount[i]
    state.tShift[line] = tShift[i]
  }
}
