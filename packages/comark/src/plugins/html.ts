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
 * Options:
 * - `markdown` (default `true`): expand text leaves inside closed HTML
 *   fragments as inline markdown (`<h1>Hello **World**</h1>` → strong).
 *   When `false`, text inside HTML stays literal (CommonMark default for
 *   closed html_blocks). Blank-line bodies still nest as markdown tokens
 *   via bare open/close pairing.
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

export interface HtmlPluginOptions {
  /**
   * Expand text leaves inside closed HTML fragments as inline markdown.
   * @default true
   */
  markdown?: boolean
}

export default defineComarkPlugin((opts: HtmlPluginOptions = {}) => {
  const markdown = opts.markdown !== false

  function markdownItHtml(md: MarkdownExit) {
    md.set({ html: true })
    // @ts-expect-error - internal utils
    const html_block = md.block.ruler.__rules__.find((r) => r.name === 'html_block')
    html_block.fn = () => {}
    // md.core.ruler.after('inline', 'comark_html_balance', html_balance)
    // Opt-out marker read by createMarkdownParser: when present, closed HTML
    // body text stays literal instead of being re-parsed as inline markdown.
    if (!markdown) {
      md.core.ruler.push('comark_html_no_markdown', () => {})
    }
  }

  return {
    name: 'html',
    markdownItPlugins: [markdownItHtml as unknown as MarkdownItPlugin],
  }
})
