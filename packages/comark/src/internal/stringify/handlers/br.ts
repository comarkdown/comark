import type { State } from 'comark/render'
import type { ElementNode, Node } from 'comark'

const COMPONENT_PREV_CHAR = /[ \t\n*_[\]})>]$/

function isBr(node: Node | undefined) {
  return Array.isArray(node) && node[0] === 'br'
}

export function br(node: ElementNode, state: State, parent?: ElementNode) {
  const index = parent ? parent.indexOf(node) : -1
  if (index < 2) return '  \n'

  const prev = index > 2 ? (parent![index - 1] as Node) : undefined
  const next = parent![index + 1] as Node | undefined

  // A trailing-space break drops adjacent whitespace and needs content on both sides
  const hardBreak =
    prev !== undefined &&
    next !== undefined &&
    !isBr(prev) &&
    !isBr(next) &&
    !(typeof prev === 'string' && /\s$/.test(prev)) &&
    !(typeof next === 'string' && /^\s/.test(next))
  if (hardBreak) return '  \n'

  if (state.context.format === 'markdown/comark' && typeof prev === 'string' && COMPONENT_PREV_CHAR.test(prev)) {
    return ':br'
  }
  return '<br>'
}
