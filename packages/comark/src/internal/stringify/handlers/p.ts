import type { State } from '../types'
import type { ComarkElement, ComarkNode } from '../../../ast/types'

export function p(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  return children.map(child => state.one(child, state, node)).join('') + state.context.blockSeparator
}
