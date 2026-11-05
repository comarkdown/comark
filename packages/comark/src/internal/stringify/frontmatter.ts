import type { DumpOptions } from 'js-yaml'
import { stringifyYaml } from './yaml.ts'

const FRONTMATTER_DELIMITER_DEFAULT = '---'
const LF = '\n'

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
