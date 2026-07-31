import type { State } from 'comark/render'
import type { ElementNode } from 'comark'

export function comment(node: ElementNode, _state: State) {
  if (node[0] === null) {
    return `<!--${node[2]}-->` + _state.context.blockSeparator
  }

  return ''
}
