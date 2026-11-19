import type { DumpOptions } from 'js-yaml'
import { parseYaml, stringifyYaml } from './yaml.ts'

const FRONTMATTER_DELIMITER_DEFAULT = '---'
const LF = '\n'
const CR = '\r'
const BOM = '\uFEFF'

/**
 * Find the line that closes the frontmatter: `---` alone on its line, with optional trailing spaces or tabs.
 * @returns The index of the line feed before the delimiter, and the index after the delimiter line's content
 */
function findClosingDelimiter(content: string, from: number) {
  let idx = content.indexOf(LF + FRONTMATTER_DELIMITER_DEFAULT, from)
  while (idx !== -1) {
    let end = idx + 1 + FRONTMATTER_DELIMITER_DEFAULT.length
    while (content[end] === ' ' || content[end] === '\t') end++
    if (content[end] === CR) end++
    if (end === content.length || content[end] === LF) return { idx, end }
    idx = content.indexOf(LF + FRONTMATTER_DELIMITER_DEFAULT, idx + 1)
  }
}

/** Extract leading YAML frontmatter (`---`) from markdown content. */
export function parseFrontmatter(content: string) {
  let data: Record<string, any> = {}
  let frontmatter = ''
  const start = content.startsWith(BOM) ? BOM.length : 0
  if (content.startsWith(FRONTMATTER_DELIMITER_DEFAULT, start)) {
    const close = findClosingDelimiter(content, start)
    if (close) {
      const { idx, end } = close
      const hasCarriageReturn = content[idx - 1] === CR
      frontmatter = content.slice(start + 4, idx - (hasCarriageReturn ? 1 : 0))
      if (frontmatter) {
        try {
          data = parseYaml(frontmatter) ?? {}
        } catch (error) {
          console.warn(`[comark/plugins/frontmatter] ignoring invalid YAML frontmatter: ${(error as Error).message}`)
        }
        content = content.slice(end)
      }
    }
  }

  return {
    content,
    data,
    frontmatterText: frontmatter,
  }
}

/** Prepend serialized YAML frontmatter (`---`) to markdown content when `data` is non-empty. */
export function renderFrontmatter(
  data: Record<string, any> | undefined | null,
  content?: string,
  yamlOptions?: DumpOptions
): string {
  if (!data || Object.keys(data).length === 0) {
    return content?.trim() || ''
  }

  const fm = stringifyYaml(data, yamlOptions).trim()
  if (content) {
    return FRONTMATTER_DELIMITER_DEFAULT + LF + fm + LF + FRONTMATTER_DELIMITER_DEFAULT + LF + LF + content.trim()
  }

  return fm
}
