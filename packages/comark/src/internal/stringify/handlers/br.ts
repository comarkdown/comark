import type { State } from 'comark/render'
import type { ElementNode } from 'comark'

export function br(_: ElementNode, _state: State) {
  return '  \n'
}
