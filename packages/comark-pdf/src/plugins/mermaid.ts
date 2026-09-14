import { Text, Box } from '@jasy/pdf'
import type { ElementNode } from 'comark'
import type { JasyComponentFn } from '../jasy.ts'

export * from 'comark/plugins/mermaid'
export { default } from 'comark/plugins/mermaid'

/**
 * jasy component render function for mermaid nodes.
 *
 * Note: beautiful-mermaid renders to SVG/HTML which jasy cannot consume directly.
 * This component renders the diagram source as a monospace code block. For rich
 * diagram rendering, rasterize the SVG to a PNG and use jasy's Image component.
 *
 * @example
 * ```typescript
 * import mermaid, { Mermaid } from '@comark/pdf/plugins/mermaid'
 * import { renderPdf } from '@comark/pdf'
 *
 * const bytes = await renderPdf(markdown, {
 *   plugins: [mermaid()],
 *   components: { Mermaid },
 * })
 * ```
 */
export const Mermaid: JasyComponentFn = ([, attrs]: ElementNode) => {
  const content = String(attrs.content ?? '')
  return Box(
    { bg: '#f6f8fa', padding: 10, radius: 4 },
    [Text(content, { font: 'Courier', size: 10 })],
  )
}
