import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'

export function hr(_: ComarkElement, state: State) {
  return '---' + state.context.blockSeparator
}
