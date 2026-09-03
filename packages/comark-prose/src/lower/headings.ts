import type { ElementNode, Node } from 'comark'
import type { HeadingTag, ProseContext, ProseElementsOptions } from '../types.ts'
import { attrsOf, childrenOf, isElement, takeBoolAttr } from '../utils.ts'

const DEFAULT_ANCHORS: Partial<Record<HeadingTag, boolean>> = { h2: true, h3: true, h4: true }

/** Self-contained inline hash icon (lucide `hash`), used when no `anchorIcon` is set. */
const HASH_ICON: ElementNode = [
  'svg',
  {
    class: 'prose-anchor-icon',
    'aria-hidden': 'true',
    viewBox: '0 0 24 24',
    width: '1em',
    height: '1em',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  },
  ['path', { d: 'M4 9h16M4 15h16M10 3L8 21M16 3l-2 21' }],
]

function anchorIcon(options: ProseElementsOptions): Node | undefined {
  const icon = options.anchorIcon
  if (icon === false) return undefined
  if (typeof icon === 'string') return ['span', { class: `prose-anchor-icon ${icon}`, 'aria-hidden': 'true' }]
  if (Array.isArray(icon)) return icon
  return HASH_ICON
}

function anchorEnabled(options: ProseElementsOptions, tag: HeadingTag): boolean {
  const anchors = options.headingAnchors
  if (typeof anchors === 'boolean') return anchors
  return (anchors ?? DEFAULT_ANCHORS)[tag] ?? false
}

/**
 * Wraps a heading's content in a plain `<a href="#id">` anchor link, mirroring the usual
 * docs pattern. Skipped when the heading has no id, contains a link already (nested
 * anchors are invalid HTML), or carries `{anchor=false}`.
 */
export function lowerHeading(node: ElementNode, ctx: ProseContext): void {
  if (ctx.elements === false) return
  const tag = node[0] as HeadingTag
  const attrs = attrsOf(node)
  const anchor = takeBoolAttr(attrs, 'anchor')
  if (anchor === false) return
  if (!anchor && !anchorEnabled(ctx.elements, tag)) return

  const id = attrs.id
  if (typeof id !== 'string' || !id) return

  const children = childrenOf(node)
  if (children.some((child) => isElement(child) && child[0] === 'a')) return

  const link: ElementNode = ['a', { href: `#${id}`, class: 'prose-anchor' }]
  const icon = anchorIcon(ctx.elements)
  if (icon) link.push(icon)
  link.push(...children)

  node.length = 2
  node.push(link)
}
