import type { ElementNode, Node } from 'comark'
import type { ProseContext } from '../types.ts'
import { attrsOf, childrenOf, isElement, setClass, takeAttr, takeBoolAttr } from '../utils.ts'

/**
 * Lowers a single `::accordion-item{label}` into a native `<details>`.
 * `name` groups items exclusively (one open at a time) — pure HTML, zero JS.
 */
function lowerItem(item: ElementNode, ctx: ProseContext, name: string | undefined): Node {
  const attrs = attrsOf(item)
  const label = takeAttr(attrs, 'label') ?? 'Details'
  const open = takeBoolAttr(attrs, 'open')

  const detailsAttrs: Record<string, unknown> = { ...attrs }
  if (name) detailsAttrs.name = name
  if (open) detailsAttrs.open = ''
  setClass(ctx, detailsAttrs, 'prose-accordion-item')

  return [
    'details',
    detailsAttrs,
    ['summary', { class: 'prose-accordion-trigger' }, label],
    ['div', { class: 'prose-accordion-content' }, ...childrenOf(item)],
  ]
}

/**
 * Lowers `::accordion` with `::accordion-item{label}` children into a group of native
 * `<details name>` elements. Exclusive open by default; add `{multiple}` on the accordion
 * to allow several items open at once.
 */
export function lowerAccordion(node: ElementNode, ctx: ProseContext): Node | undefined {
  const attrs = attrsOf(node)
  const multiple = takeBoolAttr(attrs, 'multiple')
  const name = multiple ? undefined : ctx.nextId('accordion')

  const items: Node[] = []
  for (const child of childrenOf(node)) {
    if (isElement(child) && child[0] === 'accordion-item') {
      items.push(lowerItem(child, ctx, name))
    } else {
      items.push(child)
    }
  }

  if (items.length === 0) return undefined

  const rootAttrs: Record<string, unknown> = { ...attrs }
  setClass(ctx, rootAttrs, 'prose-accordion')
  return ['div', rootAttrs, ...items]
}
