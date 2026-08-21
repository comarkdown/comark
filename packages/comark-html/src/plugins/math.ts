import type { ElementNode } from 'comark'
import katex from 'katex'
import { escapeHtml } from '../utils/index.ts'

export * from 'comark/plugins/math'
export { default } from 'comark/plugins/math'

/**
 * HTML component render function for math nodes. Renders LaTeX to HTML via KaTeX.
 *
 * Include `katex/dist/katex.min.css` in your page for proper styling.
 *
 * @example
 * ```typescript
 * import math, { Math } from '@comark/html/plugins/math'
 * import { createHtmlRenderer } from '@comark/html'
 *
 * const renderHtml = createHtmlRenderer({
 *   plugins: [math()],
 *   components: { Math },
 * })
 * ```
 */
export const Math = ([, attrs]: ElementNode): string => {
  const content = String(attrs.content ?? '')
  const isInline = String(attrs.class ?? '').includes('inline')

  try {
    const rendered = katex.renderToString(content, {
      displayMode: !isInline,
      throwOnError: false,
      output: 'html',
    })
    return isInline ? `<span class="math inline">${rendered}</span>` : `<div class="math block">${rendered}</div>`
  } catch {
    // KaTeX can still throw non-ParseErrors (e.g. RangeError on deeply nested
    // input) — never interpolate the raw source unescaped.
    return isInline
      ? `<span class="math inline">${escapeHtml(content)}</span>`
      : `<div class="math block">${escapeHtml(content)}</div>`
  }
}
