import type { State } from '../types'
import type { ComarkElement } from '../../../ast/types'

export function br(_: ComarkElement, _state: State) {
  return '  \n'
}
