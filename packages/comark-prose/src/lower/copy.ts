import type { ElementNode, Node } from 'comark'
import type { ProseContext } from '../types.ts'
import { attrsOf } from '../utils.ts'

/**
 * Wraps a code fence in a figure carrying the filename header and a `<prose-copy>`
 * custom element:
 *
 * ```html
 * <figure class="prose-pre">
 *   <figcaption class="prose-pre-filename">nuxt.config.ts</figcaption>
 *   <prose-copy><button type="button" aria-label="Copy code"></button></prose-copy>
 *   <pre>…</pre>
 * </figure>
 * ```
 *
 * The button icon comes from CSS (mask on `::before`), so the tree stays small. The
 * stylesheet hides `prose-copy:not(:defined)`, so pages without the client runtime never
 * show a dead button.
 */
export function lowerPre(node: ElementNode, ctx: ProseContext): Node | undefined {
  if (ctx.copy === false) return undefined
  const attrs = attrsOf(node)

  const children: Node[] = []
  if (typeof attrs.filename === 'string' && attrs.filename) {
    children.push(['figcaption', { class: 'prose-pre-filename' }, attrs.filename])
  }
  children.push([
    'prose-copy',
    { class: 'prose-copy' },
    ['button', { type: 'button', class: 'prose-copy-button', 'aria-label': ctx.copy.label ?? 'Copy code' }],
  ])
  children.push(node)

  return ['figure', { class: 'prose-pre' }, ...children]
}
