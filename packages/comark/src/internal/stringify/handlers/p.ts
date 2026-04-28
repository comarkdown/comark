import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'

export async function p(node: ComarkElement, state: State, parent?: ComarkElement) {
  const children = node.slice(2) as ComarkNode[]

  let result = ''
  for (const child of children) {
    result += await state.one(child, state, node)
  }

  if (parent?.[0] === 'li') {
    return result
  }
  return result + state.context.blockSeparator
}
