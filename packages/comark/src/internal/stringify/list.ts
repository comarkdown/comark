import type { State } from 'comark/render'
import type { ElementNode, MarkdownDocument, Node } from 'comark'
import { comarkAttributes, userBlockAttrs } from './attributes.ts'

/**
 * Pick the marker of a `ul` (`-` or `*`) or `ol` (`.` or `)`) node.
 *
 * Two lists of the same kind that follow each other merge into one list on
 * re-parse unless the second uses a different bullet or delimiter, so the
 * marker alternates along a run of adjacent lists.
 */
export function listMarker(
  node: ElementNode,
  state: State,
  parent: ElementNode | undefined,
  markers: [string, string]
) {
  const siblings = parent
    ? (parent.slice(2) as Node[])
    : ((state.context.tree as MarkdownDocument | undefined)?.nodes ?? [])
  let alternate = false
  for (let index = siblings.indexOf(node); index > 0 && isNativeList(siblings[index - 1], node[0]); index--) {
    alternate = !alternate
  }
  return markers[alternate ? 1 : 0]
}

// A list with user attrs renders as a `::ul` / `::ol` component, which ends the run.
function isNativeList(node: Node | undefined, tag: string): boolean {
  return (
    Array.isArray(node) && node[0] === tag && !comarkAttributes(userBlockAttrs(tag, node[1] as Record<string, unknown>))
  )
}
