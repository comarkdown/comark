import type { ElementNode, Node } from 'comark'
import type { ProseContext } from '../types.ts'

/**
 * Wraps tables in a scroll container so wide tables overflow horizontally instead of
 * breaking the layout (same pattern as shadcn Typeset's `typeset-scroll`). Skipped when
 * the parent is already the wrapper (streaming re-parses revisit lowered nodes).
 */
export function lowerTable(node: ElementNode, parent: ElementNode | undefined, ctx: ProseContext): Node | undefined {
  if (ctx.elements === false) return undefined
  const wrapper = ctx.elements.tableWrapper
  if (wrapper === false) return undefined
  const tag = wrapper?.tag ?? 'div'
  const className = wrapper?.class ?? 'prose-table'
  if (
    parent &&
    parent[0] === tag &&
    typeof parent[1]?.class === 'string' &&
    parent[1].class.split(' ').includes(className)
  ) {
    return undefined
  }
  return [tag, { class: className }, node]
}
