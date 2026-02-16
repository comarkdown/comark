import type { State } from '../types'
import type { ComarkElement } from '../../../ast/types'

export function hr(_: ComarkElement, state: State) {
  return '---' + state.context.blockSeparator
}
