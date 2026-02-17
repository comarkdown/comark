import type { State } from '../types'
import type { ComarkElement } from '../../../ast/types'

// slot template
export function template(node: ComarkElement, state: State) {
  const [_, attrs] = node

  const content = state.flow(node, state).trim()

  return `#${attrs.name}\n${content}` + state.context.blockSeparator
}
