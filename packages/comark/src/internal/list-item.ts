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
  // One backward pass finds the tail that could be a thematic break: one of `-`, `*`, `_`, with spaces or tabs.
  // A marker opens no item once the rest of the line is that tail and holds 3+ of its character.
  let tailStart = end
  let breakChar = -1
  let breakCount = 0
  for (let p = end - 1; p >= start; p--) {
    const code = src.charCodeAt(p)
    if (code !== 0x20 && code !== 0x09) {
      // `-`, `*` or `_`
      if (breakChar === -1 && (code === 0x2d || code === 0x2a || code === 0x5f)) breakChar = code
      if (code !== breakChar) break
      breakCount++
    }
    tailStart = p
  }

  let pos = start
  let markerColumn = column
  while (pos < end && !(pos >= tailStart && breakCount >= 3)) {
    const markerStart = pos
    const c = src.charCodeAt(pos)
    if (c === 0x2d /* - */ || c === 0x2b /* + */ || c === 0x2a /* * */) {
      if (c === breakChar && pos >= tailStart) breakCount--
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
