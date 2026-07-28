import type { ComarkElement, ComarkNode } from '../../types.ts'

/**
 * Normalize the `unwrap` option into an ordered list of tag names.
 *
 * Tags are applied sequentially — each tag descends one level into the result
 * of the previous one — so the order is significant (MDC semantics).
 *
 * - `true` → `['p']`
 * - `'p, h1'` / `'p h1'` (comma- or whitespace-separated) → `['p', 'h1']`
 * - `['div', 'p']` → `['div', 'p']`
 * - `false` / `undefined` → `[]`
 */
export function resolveUnwrapTags(unwrap: boolean | string | string[] | undefined): string[] {
  if (!unwrap) return []
  if (unwrap === true) return ['p']
  if (typeof unwrap === 'string') {
    return unwrap
      .split(/[,\s]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
  }
  return unwrap.filter(Boolean)
}

function isElement(node: ComarkNode): node is ComarkElement {
  return Array.isArray(node) && typeof node[0] === 'string'
}

function matchesTag(node: ComarkNode, tag: string): boolean {
  return isElement(node) && (tag === '*' || node[0] === tag)
}

/**
 * Recursively unwrap `tags` from `nodes`, one tag per level — mirrors MDC's
 * `_flatUnwrap`. For each node the head tag is unwrapped (matching elements are
 * replaced by their children), then the remaining tags are applied to the
 * result. Whitespace-only text nodes are dropped at each level.
 */
function flatUnwrap(nodes: ComarkNode[], tags: string[]): ComarkNode[] {
  if (tags.length === 0) return nodes

  const [head, ...rest] = tags
  const result: ComarkNode[] = []

  for (const node of nodes) {
    // Unwrap the head tag: matching elements collapse to their children,
    // everything else passes through so the remaining tags still see it.
    const unwrapped = matchesTag(node, head!) ? (node.slice(2) as ComarkNode[]) : [node]
    for (const child of flatUnwrap(unwrapped, rest)) {
      result.push(child)
    }
  }

  return result.filter((node) => !(typeof node === 'string' && node.trim() === ''))
}

/**
 * Remove wrapper tags from a node list, hoisting matched elements' children in
 * their place — the MDC `unwrap` behaviour. After unwrapping, adjacent text
 * nodes are merged into a single string, so `unwrap: 'p'` on `a\n\nb` yields
 * `['ab']` (paragraphs merged without a separator).
 *
 * @param nodes - Nodes to process
 * @param tags - Ordered tag names (see {@link resolveUnwrapTags})
 * @returns A new node list with matching wrappers removed
 */
export function applyUnwrap(nodes: ComarkNode[], tags: string[]): ComarkNode[] {
  if (tags.length === 0) return nodes

  const unwrapped = flatUnwrap(nodes, tags)

  // Merge adjacent text nodes into a single string (MDC's final reduce step).
  const merged: ComarkNode[] = []
  for (const node of unwrapped) {
    if (typeof node === 'string' && typeof merged[merged.length - 1] === 'string') {
      merged[merged.length - 1] = (merged[merged.length - 1] as string) + node
    } else {
      merged.push(node)
    }
  }

  return merged
}
