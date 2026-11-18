import type { Node } from 'comark'

/** A named slot (`#name`). A `template` without `name` is a `:template` component. */
export function isSlot(node: Node): boolean {
  return Array.isArray(node) && node[0] === 'template' && typeof node[1]?.name === 'string'
}
