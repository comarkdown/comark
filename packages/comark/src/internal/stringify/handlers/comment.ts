import type { State } from 'comark/render'
import type { ElementNode } from 'comark'

export function comment(node: ElementNode, state: State, parent?: ElementNode) {
  if (node[0] === null) {
    return `<!--${node[2]}-->` + state.context.blockSeparator
  }

  // Comments have a `null` tag; an element named `comment` is a component.
  // (Not via `./component.ts`: `comark/render/html` imports this file and must
  // stay free of the other handlers. It never reaches here with an element.)
  return state.context.format === 'markdown/comark'
    ? state.handlers.mdc(node, state, parent)
    : state.handlers.html(node, state, parent)
}
