import type { State } from 'comark/render'
import type { ElementNode } from 'comark'

export function comment(node: ElementNode, state: State, parent?: ElementNode) {
  if (node[0] === null) {
    const inline =
      state.context.inline === true ||
      parent?.[0] === 'p' ||
      (parent?.some((child, index) => index > 1 && typeof child === 'string') ?? false)
    return `<!--${node[2]}-->` + (inline ? '' : state.context.blockSeparator)
  }

  // Comments have a `null` tag; an element named `comment` is a component.
  // (Not via `./component.ts`: `comark/render/html` imports this file and must
  // stay free of the other handlers. It never reaches here with an element.)
  return state.context.format === 'markdown/comark'
    ? state.handlers.mdc(node, state, parent)
    : state.handlers.html(node, state, parent)
}
