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
import { parseFrontmatter } from '../internal/frontmatter.ts'

export default defineComarkPlugin(() => ({
  name: 'frontmatter',
  pre(state) {
    const { content, data, frontmatterText } = parseFrontmatter(state.markdown)
    state.markdown = content
    state.frontmatter = data
    state.frontmatterText = frontmatterText

    // Offset line numbers on body nodes past the stripped frontmatter (+1 closing fence).
    if (content && frontmatterText) {
      state.parsedLines = (state.parsedLines ?? 0) + frontmatterText.split('\n').length + 1
    }
  },
}))
