import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'

export function comment(node: ComarkElement, _state: State) {
  if (node[0] === null) {
    return `<!--${node[2]}-->` + _state.context.blockSeparator
  }

  return ''
}
