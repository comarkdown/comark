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
// import html_balance from '../internal/parse/html/html_balance_rule.ts'

function markdownItHtml(md: MarkdownExit) {
  md.set({ html: true })
  // md.core.ruler.after('inline', 'comark_html_balance', html_balance)
}

export default defineComarkPlugin(() => ({
  name: 'html',
  markdownItPlugins: [markdownItHtml as unknown as MarkdownItPlugin],
}))
