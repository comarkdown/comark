import { PageBreak as JasyPageBreak, Box } from '@jasy/pdf'
import type { JasyComponentFn } from '../jasy.ts'

/**
 * jasy component render function for `::page-break` nodes.
 *
 * Parsing of `::page-break` is handled automatically by the core `components` plugin
 * (enabled by default). This handler converts the parsed AST node to a jasy
 * `PageBreak()` call, which forces a page break in the generated PDF.
 *
 * The `type` attribute is mapped to jasy's `breakBefore`/`breakAfter` prop on a Box:
 *   type="after"  (default) — break after this element
 *   type="before"           — break before this element
 *
 * @example
 * ```typescript
 * import { renderPdf } from '@comark/pdf'
 * import { PageBreak } from '@comark/pdf/plugins/page-break'
 *
 * const bytes = await renderPdf(markdown, {
 *   components: { 'page-break': PageBreak },
 * })
 * ```
 */
export const PageBreak: JasyComponentFn = ([, attrs]) => {
  const type = String(attrs.type ?? 'after')
  if (type === 'before') {
    return Box({ breakBefore: true }, [])
  }
  return JasyPageBreak()
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
