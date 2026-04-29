/**
 * Parse content within square brackets `[content]`.
 * Returns the content (without the brackets) and the index just past the closing `]`.
 */
export function parseBracketContent(str: string, startIndex: number): { content: string; endIndex: number } | null {
  if (str[startIndex] !== '[') return null

  let index = startIndex + 1

  while (index < str.length) {
    if (str[index] === '\\' && index + 1 < str.length) {
      index += 2
      continue
    }
    if (str[index] === ']') {
      return { content: str.slice(startIndex + 1, index), endIndex: index + 1 }
    }
    index += 1
  }

  return null
}
