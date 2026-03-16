import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'

export function br(_: ComarkElement, _state: State) {
  return '  \n'
}
