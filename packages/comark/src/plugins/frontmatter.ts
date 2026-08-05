/**
 * Frontmatter plugin for Comark.
 *
 * Parses a leading YAML frontmatter block (`---`) into `tree.frontmatter`
 * and strips it from the markdown body before tokenization.
 *
 * On by default via `registerDefaultPlugins`.
 * Pass `frontmatter({ enabled: false })` or `registerDefaultPlugins: false`
 * to treat the `---` block as regular markdown content.
 *
 * @example
 * ```ts
 * import { parseMarkdown } from 'comark'
 * import frontmatter from 'comark/plugins/frontmatter'
 *
 * const result = await parseMarkdown('---\ntitle: Hi\n---\n\n# Hello')
 * // result.frontmatter → { title: 'Hi' }
 *
 * // Disable (overrides the default frontmatter plugin by name)
 * const plain = await parseMarkdown('---\ntitle: Hi\n---\n\n# Hello', {
 *   plugins: [frontmatter({ enabled: false })],
 * })
 * // plain.frontmatter → {}  (--- becomes an hr / heading content)
 * ```
 */

import { defineComarkPlugin } from '../utils/helpers.ts'
import { parseFrontmatter } from '../internal/frontmatter.ts'

export interface FrontmatterOptions {
  /**
   * When `false`, the plugin is a no-op (frontmatter is left as markdown).
   * Useful to override the default via `plugins: [frontmatter({ enabled: false })]`.
   *
   * @default true
   */
  enabled?: boolean
}

export default defineComarkPlugin((options: FrontmatterOptions = {}) => {
  const { enabled = true } = options

  if (!enabled) {
    return { name: 'frontmatter' }
  }

  return {
    name: 'frontmatter',
    pre(state) {
      const { content, data, frontmatterText } = parseFrontmatter(state.markdown)
      state.markdown = content
      state.frontmatter = data
      state.frontmatterText = frontmatterText

      // Count frontmatter lines for line number tracking on subsequent nodes
      if (content && frontmatterText) {
        state.parsedLines =
          (state.parsedLines ?? 0) +
          frontmatterText.split('\n').length + // Number of lines in frontmatter
          1 // Separator line
      }
    },
  }
})
