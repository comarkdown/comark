import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes } from '../attributes.ts'

export async function p(node: ElementNode, state: State, parent?: ElementNode) {
  let result = await state.flow(node, state, undefined, { atLineStart: true })

  const attrs = comarkAttributes(node[1])
  if (attrs) result = `${result.replace(/[ \t]+$/, '')} ${attrs}`

  if (parent?.[0] === 'li') {
    return result
  }
  return result + state.context.blockSeparator
}
