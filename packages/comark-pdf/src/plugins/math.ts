import { Text, Box } from '@jasy/pdf'
import type { ElementNode } from 'comark'
import type { JasyComponentFn } from '../jasy.ts'

export * from 'comark/plugins/math'
export { default } from 'comark/plugins/math'

/**
 * jasy component render function for math nodes.
 *
 * Note: KaTeX renders to HTML which jasy cannot consume. This component renders
 * the LaTeX source as monospace text inside a tinted box. For rich math rendering,
 * consider rasterizing to an image and using jasy's Image component.
 *
 * @example
 * ```typescript
 * import math, { Math } from '@comark/pdf/plugins/math'
 * import { renderPdf } from '@comark/pdf'
 *
 * const bytes = await renderPdf(markdown, {
 *   plugins: [math()],
 *   components: { Math },
 * })
 * ```
 */
export const Math: JasyComponentFn = ([, attrs]: ElementNode) => {
  const content = String(attrs.content ?? '')
  const isInline = String(attrs.class ?? '').includes('inline')

  if (isInline) {
    return Text(content, { font: 'Courier', size: 11 })
  }
  return Box(
    { bg: '#f6f8fa', padding: 10, radius: 4 },
    [Text(content, { font: 'Courier', size: 11 })],
  )
}
