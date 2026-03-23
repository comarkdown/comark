import type { NodeHandler } from 'comark/render'
import type { ComarkNode } from 'comark'

export const p: NodeHandler = async (node, state) => {
  const children = node.slice(2) as ComarkNode[]
  let result = ''
  for (const child of children) {
    result += await state.one(child, state, node)
  }
  return result + '\n\n'
}
