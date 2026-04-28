import type { DumpOptions } from 'js-yaml'
import { parseYaml, stringifyYaml } from './yaml.ts'

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
        data = parseYaml(frontmatter)
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

/**
 * Render frontmatter to content
 * @param data - The data to render
 * @param content - The content to render
 * @returns The rendered content
 */
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
