export function indent(text: string, { ignoreFirstLine = false, level = 1 }: { ignoreFirstLine?: boolean, level?: number } = {}) {
  return text.split('\n').map((line, index) => {
    if (ignoreFirstLine && index === 0) {
      return line
    }
    return line ? '  '.repeat(level) + line : line
  }).join('\n')
}
