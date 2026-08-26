import type { ElementNode, Node } from 'comark'
import type { ProseContext } from '../types.ts'
import { attrsOf, childrenOf, isElement, takeAttr } from '../utils.ts'
import { buildTabs, type TabEntry } from './tabs.ts'

/**
 * Finds the `pre` node inside a code-group child. The copy lowering runs bottom-up
 * before this one, so a code fence may already be wrapped in `<figure class="prose-pre">`.
 */
function findPre(child: Node): ElementNode | undefined {
  if (!isElement(child)) return undefined
  if (child[0] === 'pre') return child
  if (child[0] === 'figure') {
    for (const inner of childrenOf(child)) {
      if (isElement(inner) && inner[0] === 'pre') return inner
    }
  }
  return undefined
}

/**
 * Lowers `::code-group` into the shared `<prose-tabs>` markup. Each code fence becomes a
 * panel labelled by its `[filename]`, falling back to the fence language. Non-code
 * children are kept ahead of the tabs so no content is dropped.
 */
export function lowerCodeGroup(node: ElementNode, ctx: ProseContext): Node | undefined {
  const attrs = attrsOf(node)
  const entries: TabEntry[] = []
  const leading: Node[] = []

  for (const child of childrenOf(node)) {
    const pre = findPre(child)
    if (!pre) {
      leading.push(child)
      continue
    }
    const preAttrs = attrsOf(pre)
    const label =
      (typeof preAttrs.filename === 'string' && preAttrs.filename) ||
      (typeof preAttrs.language === 'string' && preAttrs.language) ||
      `Code ${entries.length + 1}`
    entries.push({ label, children: [child] })
  }

  if (entries.length === 0) return undefined

  const sync = takeAttr(attrs, 'sync')
  const rootAttrs: Record<string, unknown> = { ...attrs }
  if (sync) rootAttrs['data-sync'] = sync

  const tabs = buildTabs(ctx, entries, rootAttrs, 'prose-tabs prose-code-group')
  if (leading.length === 0) return tabs
  return ['div', { class: 'prose-code-group-extra' }, ...leading, tabs]
}
