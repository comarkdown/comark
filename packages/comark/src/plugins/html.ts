/**
 * HTML parsing plugin for Comark.
 *
 * Enables embedded HTML block and inline tags to be tokenized and later
 * converted into AST nodes by the token processor.
 *
 * On by default via `registerDefaultPlugins` (and the `html` parse option).
 * Pass `html: false`, `html({ enabled: false })`, or `registerDefaultPlugins: false`
 * to treat HTML tags as plain text.
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
 * // Disable via plugin option (overrides the default html plugin by name)
 * const plain = await parseMarkdown('<em>hi</em>', {
 *   plugins: [html({ enabled: false })],
 * })
 * // → [ ['p', {}, '<em>hi</em>'] ]
 * ```
 */

import type { MarkdownExit } from 'markdown-exit'
import type { MarkdownItPlugin } from '../types.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'
import html_block from '../internal/parse/html/html_block_rule.ts'
import html_inline from '../internal/parse/html/html_inline_rule.ts'

export interface HtmlOptions {
  /**
   * When `false`, the plugin is a no-op (no markdown-it rules registered).
   * Useful to override the default html plugin via `plugins: [html({ enabled: false })]`.
   *
   * @default true
   */
  enabled?: boolean
}

function markdownItHtml(md: MarkdownExit) {
  md.set({ html: true })
  md.inline.ruler.before('text', 'comark_html_inline', html_inline)
  md.block.ruler.before('html_block', 'comark_html_block', html_block, {
    alt: ['paragraph', 'reference', 'blockquote'],
  })
}

export default defineComarkPlugin((options: HtmlOptions = {}) => {
  const { enabled = true } = options

  return {
    name: 'html',
    markdownItPlugins: enabled ? [markdownItHtml as unknown as MarkdownItPlugin] : [],
  }
})
