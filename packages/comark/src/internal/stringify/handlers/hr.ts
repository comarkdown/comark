import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'

export function hr(_: ComarkElement, state: State, parent?: ComarkElement) {
  if (parent?.[0] === 'p') {
    return ':hr'
  }

  return '---' + state.context.blockSeparator
}
