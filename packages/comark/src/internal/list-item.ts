/**
 * Content column of the list item whose marker starts at `start`, or -1 when the line opens none.
 * `column` is the column of `start` and `end` the end of the line.
 */
export function listItemContentColumn(src: string, start: number, end: number, column: number): number {
  let pos = start
  const c = src.charCodeAt(pos)
  if (c === 0x2d /* - */ || c === 0x2b /* + */ || c === 0x2a /* * */) {
    pos++
  } else {
    while (pos < end && pos - start < 9 && src.charCodeAt(pos) >= 0x30 && src.charCodeAt(pos) <= 0x39) pos++
    const d = pos < end ? src.charCodeAt(pos) : -1
    if (pos === start || (d !== 0x2e /* . */ && d !== 0x29) /* ) */) return -1
    pos++
  }

  const markerEnd = column + pos - start
  if (pos >= end) return markerEnd + 1

  // Padding is measured in columns: a tab moves to the next multiple of 4.
  let padded = markerEnd
  while (pos < end && (src.charCodeAt(pos) === 0x20 || src.charCodeAt(pos) === 0x09)) {
    padded = src.charCodeAt(pos) === 0x09 ? padded + 4 - (padded % 4) : padded + 1
    pos++
  }
  const spaces = padded - markerEnd
  if (spaces === 0) return -1

  // An empty item, or content 5+ columns out (indented code), starts one column after the marker.
  return pos >= end || spaces > 4 ? markerEnd + 1 : markerEnd + spaces
}
