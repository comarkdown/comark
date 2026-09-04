/**
 * HTML parsing plugin for Comark.
 *
 * Enables embedded HTML block and inline tags to be tokenized and later
 * converted into AST nodes by the token processor.
 *
 * On by default via `registerDefaultPlugins`.
 * Pass `registerDefaultPlugins: false` (and omit this plugin) to treat HTML
 * tags as plain text.
 *
 * @example
 * ```ts
 * import { parseMarkdown } from 'comark'
 * import html from 'comark/plugins/html'
 *
 * // Explicit registration (also on by default via registerDefaultPlugins)
 * const result = await parseMarkdown('<strong class="bold">Hello</strong>', {
 *   plugins: [html()],
 * })
 * // → [ ['strong', { class: 'bold', $: { html: 1, block: 0 } }, 'Hello'] ]
 *
 * // Blank-line-only markdown nesting (CommonMark-style HTML blocks)
 * const raw = await parseMarkdown('<div>\n**bold**\n</div>', {
 *   plugins: [html({ markdown: false })],
 * })
 * // → body stays literal `**bold**` (no strong node)
 *
 * // Blank line still enables markdown either way:
 * // <div>\n\n**bold**\n\n</div> → strong
 * ```
 */

import type { MarkdownExit } from 'markdown-exit'
import type { MarkdownItPlugin } from '../types.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'
import createHtmlBlockRule from '../internal/parse/html/html_block_rule.ts'
import html_inline from '../internal/parse/html/html_inline_rule.ts'

export interface HtmlPluginOptions {
  /**
   * When markdown is allowed inside / after HTML **without** a blank line.
   *
   * - `true` (default): tight incomplete openers (no closer yet) still tokenize
   *   the body as markdown. Closed tight bodies stay CommonMark-raw.
   * - `false`: tight bodies stay raw HTML (CommonMark). Markdown only when a
   *   blank line separates the open tag from the body.
   *
   * @default true
   */
  markdown?: boolean
}

function markdownItHtml(options: HtmlPluginOptions = {}) {
  const html_block = createHtmlBlockRule({ markdown: options.markdown })

  return function install(md: MarkdownExit) {
    md.set({ html: true })
    md.inline.ruler.before('text', 'comark_html_inline', html_inline)
    md.block.ruler.before('html_block', 'comark_html_block', html_block, {
      alt: ['paragraph', 'reference', 'blockquote'],
    })
  }
}

export default defineComarkPlugin<HtmlPluginOptions>((options = {}) => ({
  name: 'html',
  markdownItPlugins: [markdownItHtml(options) as unknown as MarkdownItPlugin],
}))
