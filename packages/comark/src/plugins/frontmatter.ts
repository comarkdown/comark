/**
 * Frontmatter plugin for Comark.
 *
 * Parses a leading YAML frontmatter block (`---`) into `tree.frontmatter`
 * and strips it from the markdown body before tokenization.
 *
 * On by default via `registerDefaultPlugins`.
 * Pass `registerDefaultPlugins: false` (and omit this plugin) to treat the
 * `---` block as regular markdown content.
 *
 * @example
 * ```ts
 * import { parseMarkdown } from 'comark'
 * import frontmatter from 'comark/plugins/frontmatter'
 *
 * const result = await parseMarkdown('---\ntitle: Hi\n---\n\n# Hello')
 * // result.frontmatter -> { title: 'Hi' }
 * ```
 */

import { defineComarkPlugin } from '../utils/helpers.ts'
import { parseYaml } from '../utils/yaml.ts'

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
function splitFrontmatter(content: string): { content: string; frontmatterText: string } {
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

export default defineComarkPlugin(() => ({
  name: 'frontmatter',
  pre(state) {
    let result: ReturnType<typeof parseFrontmatter>
    try {
      result = parseFrontmatter(state.markdown)
    } catch (error) {
      console.warn(`[comark/plugins/frontmatter] ignoring invalid YAML frontmatter: ${(error as Error).message}`)
      result = { ...splitFrontmatter(state.markdown), data: {} }
    }
    const { content, data, frontmatterText } = result
    state.markdown = content
    state.frontmatter = data
    state.frontmatterText = frontmatterText

    // Offset line numbers on body nodes past the stripped frontmatter (+1 closing fence).
    if (content && frontmatterText) {
      state.parsedLines = (state.parsedLines ?? 0) + frontmatterText.split('\n').length + 1
    }
  },
}))
