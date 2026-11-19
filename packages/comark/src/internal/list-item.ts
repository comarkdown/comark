/**
 * Writes the content column of each list item whose marker starts at `start` into `columns`, from index `depth`.
 * Returns the new depth. `- - item` opens two items; a thematic break such as `- - -` opens none.
 * `column` is the column of `start` and `end` the end of the line.
 */
export function pushListItems(
  src: string,
  start: number,
  end: number,
  column: number,
  columns: number[],
  depth: number
): number {
  let pos = start
  let markerColumn = column
  while (pos < end && !isThematicBreak(src, pos, end)) {
    const markerStart = pos
    const c = src.charCodeAt(pos)
    if (c === 0x2d /* - */ || c === 0x2b /* + */ || c === 0x2a /* * */) {
      pos++
    } else {
      while (pos < end && pos - markerStart < 9 && src.charCodeAt(pos) >= 0x30 && src.charCodeAt(pos) <= 0x39) pos++
      const d = pos < end ? src.charCodeAt(pos) : -1
      if (pos === markerStart || (d !== 0x2e /* . */ && d !== 0x29) /* ) */) break
      pos++
    }

    const markerEnd = markerColumn + pos - markerStart
    if (pos >= end) {
      columns[depth++] = markerEnd + 1
      break
    }

    // Padding is measured in columns: a tab moves to the next multiple of 4.
    let padded = markerEnd
    while (pos < end && (src.charCodeAt(pos) === 0x20 || src.charCodeAt(pos) === 0x09)) {
      padded = src.charCodeAt(pos) === 0x09 ? padded + 4 - (padded % 4) : padded + 1
      pos++
    }
    const spaces = padded - markerEnd
    if (spaces === 0) break

    // An empty item, or content 5+ columns out (indented code), starts one column after the marker and nests nothing.
    if (pos >= end || spaces > 4) {
      columns[depth++] = markerEnd + 1
      break
    }
    columns[depth++] = padded
    markerColumn = padded
  }
  return depth
}

/** Whether `src[start, end)` is a thematic break: 3+ of one of `-`, `*`, `_`, with only spaces or tabs between. */
function isThematicBreak(src: string, start: number, end: number): boolean {
  const c = src.charCodeAt(start)
  if (c !== 0x2d /* - */ && c !== 0x2a /* * */ && c !== 0x5f /* _ */) return false
  let count = 0
  for (let pos = start; pos < end; pos++) {
    const code = src.charCodeAt(pos)
    if (code === c) count++
    else if (code !== 0x20 && code !== 0x09) return false
  }
  return count >= 3
}
