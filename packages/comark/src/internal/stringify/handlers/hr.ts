import type { State } from 'comark/render'
import type { ElementNode } from 'comark'

export function hr(_: ElementNode, state: State, parent?: ElementNode) {
  if (parent?.[0] === 'p') {
    return ':hr'
  }

  return '---' + state.context.blockSeparator
}
