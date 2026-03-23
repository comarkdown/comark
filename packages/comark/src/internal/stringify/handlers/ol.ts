import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'
import { indent } from '../indent'

export async function ol(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  const revert = state.applyContext({ list: true, order: 1 })

  let result = ''
  for (const child of children) {
    result += await state.one(child, state)
  }
  result = result.trim()

  if (revert.list) {
    result = '\n' + indent(result)
  }
  else {
    result = result + state.context.blockSeparator
  }

  state.applyContext(revert)

  return result
}
