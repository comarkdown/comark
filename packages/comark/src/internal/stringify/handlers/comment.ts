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

  return ''
}
