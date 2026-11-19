import type { State } from 'comark/render'
import type { ElementNode, MarkdownDocument } from 'comark'
import { comarkAttributes, userBlockAttrs } from './attributes.ts'
import { sourceNode } from './state.ts'

// Per render and per sibling collection, the lists that take the second marker.
const alternateLists = new WeakMap<State['context'], WeakMap<readonly unknown[], Set<unknown>>>()

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
  const siblings: readonly unknown[] = parent ?? (state.context.tree as MarkdownDocument | undefined)?.nodes ?? []
  let byCollection = alternateLists.get(state.context)
  if (!byCollection) alternateLists.set(state.context, (byCollection = new WeakMap()))
  let alternates = byCollection.get(siblings)
  if (!alternates) byCollection.set(siblings, (alternates = findAlternateLists(siblings, parent ? 2 : 0)))
  return markers[alternates.has(sourceNode(node)) ? 1 : 0]
}

// One pass over the siblings: a list alternates when the one before it is a
// native list of the same kind that did not.
function findAlternateLists(siblings: readonly unknown[], start: number): Set<unknown> {
  const alternates = new Set<unknown>()
  let previousAlternates = false
  for (let index = start; index < siblings.length; index++) {
    const node = siblings[index]
    const tag = Array.isArray(node) ? node[0] : undefined
    const alternate: boolean =
      (tag === 'ul' || tag === 'ol') && index > start && isNativeList(siblings[index - 1], tag) && !previousAlternates
    if (alternate) alternates.add(node)
    previousAlternates = alternate
  }
  return alternates
}

// A list with user attrs renders as a `::ul` / `::ol` component, which ends the run.
function isNativeList(node: unknown, tag: string): boolean {
  return (
    Array.isArray(node) && node[0] === tag && !comarkAttributes(userBlockAttrs(tag, node[1] as Record<string, unknown>))
  )
}
