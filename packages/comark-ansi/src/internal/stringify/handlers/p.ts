import type { ANSINodeHandler } from '../types'
import type { ComarkNode } from 'comark/ast'

export const p: ANSINodeHandler = (node, state) => {
  const children = node.slice(2) as ComarkNode[]
  return children.map(child => state.one(child, state, node)).join('') + '\n\n'
}
