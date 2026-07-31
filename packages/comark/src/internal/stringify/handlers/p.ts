import type { State } from 'comark/render'
import type { ElementNode, Node } from 'comark'
import { comarkAttributes } from '../attributes.ts'

export async function p(node: ElementNode, state: State, parent?: ElementNode) {
  const children = node.slice(2) as Node[]

  let result = ''
  for (const child of children) {
    result += await state.one(child, state, node, result === '' || result.endsWith('\n'))
  }

  const attrs = comarkAttributes(node[1])
  if (attrs) result = `${result.replace(/[ \t]+$/, '')} ${attrs}`

  if (parent?.[0] === 'li') {
    return result
  }
  return result + state.context.blockSeparator
}
