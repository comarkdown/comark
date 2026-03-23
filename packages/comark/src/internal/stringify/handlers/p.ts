import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'

export async function p(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  let result = ''
  for (const child of children) {
    result += await state.one(child, state, node)
  }
  return result + state.context.blockSeparator
}
