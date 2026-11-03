/**
 * Index of the `\` that starts `\<close>` in `text` between `from` and `end`,
 * skipping escaped pairs such as `\\`, or -1.
 */
export function findBracketClose(text: string, from: number, close: number, end: number = text.length): number {
  for (let pos = from; pos + 1 < end; pos++) {
    if (text.charCodeAt(pos) !== 0x5c /* \ */) continue
    if (text.charCodeAt(pos + 1) === close) return pos
    pos++
  }
  return -1
}

// `\[1\]` and `\[1, 2\]` are escaped citations, not math.
export function isBracketMath(content: string): boolean {
  return content.trim() !== '' && !/^[\s\d,–-]*$/.test(content)
}
