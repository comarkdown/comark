export function indent(
  text: string,
  { ignoreFirstLine = false, level = 1, width }: { ignoreFirstLine?: boolean; level?: number; width?: number } = {}
) {
  const pad = width ? ' '.repeat(width) : '  '.repeat(level)
  return text
    .split('\n')
    .map((line, index) => {
      if (ignoreFirstLine && index === 0) {
        return line
      }
      return line ? pad + line : line
    })
    .join('\n')
}
