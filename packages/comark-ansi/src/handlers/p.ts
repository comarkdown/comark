import type { NodeHandler } from 'comark/string'
import type { ComarkNode } from 'comark/ast'

export const p: NodeHandler = (node, state) => {
  const children = node.slice(2) as ComarkNode[]
  return children.map(child => state.one(child, state, node)).join('') + '\n\n'
}
