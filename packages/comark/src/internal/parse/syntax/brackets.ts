/**
 * Find the index of the `]` closing the `[` at `openIndex`, honouring
 * backslash escapes and nested `[...]` pairs. Returns -1 when unclosed.
 */
export function findClosingBracket(str: string, openIndex: number): number {
  if (str[openIndex] !== '[') return -1

  let index = openIndex + 1
  let depth = 0

  while (index < str.length) {
    if (str[index] === '\\' && index + 1 < str.length) {
      index += 2
      continue
    }
    if (str[index] === '[') {
      depth++
    } else if (str[index] === ']') {
      if (depth === 0) return index
      depth--
    }
    index += 1
  }

  return -1
}

/**
 * Parse content within square brackets `[content]`.
 * Returns the content (without the brackets) and the index just past the closing `]`.
 */
export function parseBracketContent(str: string, startIndex: number): { content: string; endIndex: number } | null {
  const close = findClosingBracket(str, startIndex)
  if (close === -1) return null
  return { content: str.slice(startIndex + 1, close), endIndex: close + 1 }
}
