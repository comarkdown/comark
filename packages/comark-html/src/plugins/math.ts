import type { ComarkElement } from 'comark/ast'
import katex from 'katex'

export * from 'comark/plugins/math'
export { default } from 'comark/plugins/math'

/**
 * HTML component render function for math nodes. Renders LaTeX to HTML via KaTeX.
 *
 * Include `katex/dist/katex.min.css` in your page for proper styling.
 *
 * @example
 * ```typescript
 * import math, { math as mathRenderer } from '@comark/html/plugins/math'
 * import { createRender } from '@comark/html'
 *
 * const render = createRender({
 *   parse: { plugins: [math()] },
 *   render: { components: { math: mathRenderer } },
 * })
 * ```
 */
export const math = ([, attrs]: ComarkElement): string => {
  const content = String(attrs.content ?? '')
  const isInline = String(attrs.class ?? '').includes('inline')

  try {
    const rendered = katex.renderToString(content, {
      displayMode: !isInline,
      throwOnError: false,
      output: 'html',
    })
    return isInline
      ? `<span class="math inline">${rendered}</span>`
      : `<div class="math block">${rendered}</div>`
  }
  catch {
    return isInline
      ? `<span class="math inline">${content}</span>`
      : `<div class="math block">${content}</div>`
  }
}
