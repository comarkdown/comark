import type { NodeHandler } from 'comark'

/**
 * HTML component render function for `::page-break` nodes.
 *
 * Parsing of `::page-break` is handled automatically by the core `components` plugin
 * (enabled by default). This handler converts the parsed AST node to a CSS fragmentation
 * element that paged.js and Chromium's print engine both honour.
 *
 * Supported attribute:
 *   type="after"  (default) — insert a break after this element
 *   type="before"           — insert a break before this element
 *
 * @example
 * ```typescript
 * import { renderPdf } from '@comark/pdf'
 * import { PageBreak } from '@comark/pdf/plugins/page-break'
 *
 * const html = await renderPdf(markdown, {
 *   components: { 'page-break': PageBreak },
 * })
 * ```
 */
export const PageBreak: NodeHandler = ([, attrs]) => {
  const type = String(attrs.type ?? 'after')
  const style = type === 'before' ? 'break-before:page' : 'break-after:page'
  return `<div class="comark-page-break" style="${style}" aria-hidden="true"></div>`
}

/**
 * No-op parser plugin for `::page-break`.
 *
 * `::page-break` is already parsed by the built-in `components` plugin so this plugin does
 * not register any markdown-it rules. It is exported for symmetry with the rest of the
 * plugin ecosystem so users can include it in a `plugins` array if they wish.
 */
const pageBreak = () => ({ name: 'page-break' })
export default pageBreak
