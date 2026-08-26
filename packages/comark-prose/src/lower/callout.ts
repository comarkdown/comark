import type { ElementNode, Node } from 'comark'
import type { ProseContext } from '../types.ts'
import { attrsOf, childrenOf, setClass, takeAttr } from '../utils.ts'

const VARIANT_TAGS = new Set(['note', 'tip', 'important', 'warning', 'caution'])

/**
 * Lowers `::callout{color icon}`, the `::note`/`::tip`/`::important`/`::warning`/`::caution`
 * shorthands and GFM alerts (`['blockquote', { as }]`, normalized by the default `alert`
 * plugin) into one shape:
 *
 * ```html
 * <div class="prose-callout" role="note" data-variant="note">…</div>
 * ```
 *
 * `role="note"` is the ARIA role for parenthetic content; `<aside>` is avoided on purpose
 * (it is a `complementary` landmark, and a page full of callouts floods the landmark list).
 * The variant icon comes from CSS (`::before` mask); an explicit `icon` attribute renders
 * an extra `<span class="prose-callout-icon {icon}">` and sets `data-icon` so the
 * stylesheet can hide the default one.
 */
export function lowerCallout(node: ElementNode, ctx: ProseContext): Node | undefined {
  const tag = node[0]
  const attrs = attrsOf(node)

  let variant: string | undefined
  if (tag === 'callout') {
    variant = takeAttr(attrs, 'color') ?? 'note'
  } else if (VARIANT_TAGS.has(tag)) {
    variant = tag
  } else if (tag === 'blockquote' && typeof attrs.as === 'string' && VARIANT_TAGS.has(attrs.as)) {
    variant = attrs.as
    delete attrs.as
  } else {
    return undefined
  }

  const icon = takeAttr(attrs, 'icon')
  const title = takeAttr(attrs, 'title')

  const children: Node[] = childrenOf(node)
  const body: Node[] = []
  if (icon) body.push(['span', { class: `prose-callout-icon ${icon}`, 'aria-hidden': 'true' }])
  if (title) body.push(['p', { class: 'prose-callout-title' }, title])
  body.push(...children)

  const rootAttrs: Record<string, unknown> = { ...attrs, role: 'note', 'data-variant': variant }
  if (icon) rootAttrs['data-icon'] = ''
  setClass(ctx, rootAttrs, 'prose-callout')

  return ['div', rootAttrs, ...body]
}
