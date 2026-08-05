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
 * ```
 */

import type { MarkdownExit } from 'markdown-exit'
import type { MarkdownItPlugin } from '../types.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'
import html_block from '../internal/parse/html/html_block_rule.ts'
import html_inline from '../internal/parse/html/html_inline_rule.ts'

function markdownItHtml(md: MarkdownExit) {
  md.set({ html: true })
  md.inline.ruler.before('text', 'comark_html_inline', html_inline)
  md.block.ruler.before('html_block', 'comark_html_block', html_block, {
    alt: ['paragraph', 'reference', 'blockquote'],
  })
}

export default defineComarkPlugin(() => ({
  name: 'html',
  markdownItPlugins: [markdownItHtml as unknown as MarkdownItPlugin],
}))
