import { parseYaml } from './yaml.ts'

const FRONTMATTER_DELIMITER_DEFAULT = '---'
const LF = '\n'
const CR = '\r'

/**
 * Parse frontmatter from content
 * @param content - The content to parse
 * @returns The content and data
 */
export function parseFrontmatter(content: string) {
  let data: Record<string, any> = {}
  let frontmatter = ''
  if (content.startsWith(FRONTMATTER_DELIMITER_DEFAULT)) {
    const idx = content.indexOf(LF + FRONTMATTER_DELIMITER_DEFAULT)
    if (idx !== -1) {
      const hasCarriageReturn = content[idx - 1] === CR
      frontmatter = content.slice(4, idx - (hasCarriageReturn ? 1 : 0))
      if (frontmatter) {
        data = parseYaml(frontmatter) ?? {}
        content = content.slice(idx + 4 + (hasCarriageReturn ? 1 : 0))
      }
    }
  }

  return {
    content,
    data,
    frontmatterText: frontmatter,
  }
}
