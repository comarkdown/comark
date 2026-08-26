import type { ElementNode, Node } from 'comark'
import type { ProseContext } from '../types.ts'
import { attrsOf, childrenOf, isElement, setClass, takeAttr } from '../utils.ts'

export interface TabEntry {
  label: string
  icon?: string
  children: Node[]
}

/**
 * Shared markup builder for `::tabs` and `::code-group`: a `<prose-tabs>` custom element
 * containing a WAI-ARIA tablist. Server markup is complete and deterministic; the client
 * runtime only wires clicks, keyboard navigation and group sync.
 *
 * Without JavaScript the stylesheet reveals all panels stacked
 * (`prose-tabs:not(:defined)`), so content never becomes unreachable.
 */
export function buildTabs(
  ctx: ProseContext,
  entries: TabEntry[],
  rootAttrs: Record<string, unknown>,
  rootClass: string
): Node {
  const id = ctx.nextId('tabs')
  const tablist: Node = ['div', { role: 'tablist', class: 'prose-tabs-list' }]
  const panels: Node[] = []

  entries.forEach((entry, index) => {
    const selected = index === 0
    const tabId = `${id}-t${index}`
    const panelId = `${id}-p${index}`

    const button: ElementNode = [
      'button',
      {
        type: 'button',
        role: 'tab',
        id: tabId,
        class: 'prose-tab',
        'aria-controls': panelId,
        'aria-selected': selected ? 'true' : 'false',
        ...(selected ? {} : { tabindex: '-1' }),
      },
    ]
    if (entry.icon) button.push(['span', { class: `prose-tab-icon ${entry.icon}`, 'aria-hidden': 'true' }])
    button.push(entry.label)
    tablist.push(button)

    panels.push([
      'section',
      {
        role: 'tabpanel',
        id: panelId,
        class: 'prose-tab-panel',
        'aria-labelledby': tabId,
        ...(selected ? {} : { hidden: '' }),
      },
      ...entry.children,
    ])
  })

  setClass(ctx, rootAttrs, rootClass)
  return ['prose-tabs', rootAttrs, tablist, ...panels]
}

/**
 * Lowers `::tabs` with `::tab-item{label icon}` children. A `sync` attribute becomes
 * `data-sync`: instances sharing a key follow each other's selection (persisted in
 * `localStorage` by the client runtime).
 */
export function lowerTabs(node: ElementNode, ctx: ProseContext): Node | undefined {
  const attrs = attrsOf(node)
  const entries: TabEntry[] = []

  for (const child of childrenOf(node)) {
    if (!isElement(child)) continue
    if (child[0] !== 'tab-item' && child[0] !== 'tabs-item') continue
    const childAttrs = attrsOf(child)
    entries.push({
      label: takeAttr(childAttrs, 'label') ?? `Tab ${entries.length + 1}`,
      icon: takeAttr(childAttrs, 'icon'),
      children: childrenOf(child),
    })
  }

  if (entries.length === 0) return undefined

  const sync = takeAttr(attrs, 'sync')
  const rootAttrs: Record<string, unknown> = { ...attrs }
  if (sync) rootAttrs['data-sync'] = sync

  return buildTabs(ctx, entries, rootAttrs, 'prose-tabs')
}
