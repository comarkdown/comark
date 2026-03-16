import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'

export function p(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  return children.map(child => state.one(child, state, node)).join('') + state.context.blockSeparator
}
