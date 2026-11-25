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
function findClosingDelimiter(content: string, from: number): { idx: number; end: number } | undefined {
  let idx = content.indexOf(LF + FRONTMATTER_DELIMITER_DEFAULT, from)
  while (idx !== -1) {
    let end = idx + 1 + FRONTMATTER_DELIMITER_DEFAULT.length
    while (content[end] === ' ' || content[end] === '\t') end++
    if (content[end] === CR) end++
    if (end === content.length || content[end] === LF) return { idx, end }
    idx = content.indexOf(LF + FRONTMATTER_DELIMITER_DEFAULT, idx + 1)
  }
  return undefined
}

/** Split leading frontmatter (`---`) from markdown content without parsing its YAML. */
export function splitFrontmatter(content: string): { content: string; frontmatterText: string } {
  let frontmatter = ''
  const start = content.startsWith(BOM) ? BOM.length : 0
  if (content.startsWith(FRONTMATTER_DELIMITER_DEFAULT, start)) {
    const close = findClosingDelimiter(content, start)
    if (close) {
      const { idx, end } = close
      const hasCarriageReturn = content[idx - 1] === CR
      frontmatter = content.slice(start + 4, idx - (hasCarriageReturn ? 1 : 0))
      if (frontmatter) {
        content = content.slice(end)
      }
    }
  }

  return { content, frontmatterText: frontmatter }
}

/**
 * Extract leading YAML frontmatter (`---`) from markdown content.
 * @throws When the frontmatter is not valid YAML
 */
export function parseFrontmatter(content: string): {
  content: string
  data: Record<string, any>
  frontmatterText: string
} {
  const split = splitFrontmatter(content)
  const data: Record<string, any> = split.frontmatterText ? (parseYaml(split.frontmatterText) ?? {}) : {}

  return {
    content: split.content,
    data,
    frontmatterText: split.frontmatterText,
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
