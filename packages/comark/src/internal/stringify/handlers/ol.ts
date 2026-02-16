import type { State } from '../types'
import type { ComarkElement, ComarkNode } from '../../../ast/types'
import { indent } from '../indent'

export function ol(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  const revert = state.applyContext({ list: true, order: 1 })

  let result = children.map(child => state.one(child, state)).join('').trim()

  if (revert.list) {
    result = '\n' + indent(result)
  }
  else {
    result = result + state.context.blockSeparator
  }

  state.applyContext(revert)

  return result
}
