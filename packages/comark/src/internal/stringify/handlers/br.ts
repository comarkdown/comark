import type { State } from 'comark/render'
import type { ElementNode, Node } from 'comark'
import { isSpaceCode } from 'comark/utils'

function isBr(node: Node | undefined) {
  return Array.isArray(node) && node[0] === 'br'
}

export function br(node: ElementNode, state: State, parent?: ElementNode) {
  const index = parent ? parent.indexOf(node) : -1
  if (index < 2) return '  \n'

  const prev = index > 2 ? (parent![index - 1] as Node) : undefined
  const next = parent![index + 1] as Node | undefined
  const prevSpace = typeof prev === 'string' && isSpaceCode(prev.charCodeAt(prev.length - 1))
  const nextSpace = typeof next === 'string' && isSpaceCode(next.charCodeAt(0))

  // A trailing-space break drops adjacent whitespace and needs content on both sides
  const hardBreak = prev !== undefined && next !== undefined && !isBr(prev) && !isBr(next) && !prevSpace && !nextSpace
  if (hardBreak) return '  \n'

  if (state.context.format !== 'markdown/comark' || prev === undefined) return '<br>'

  // Empty `{}` delimits `:br` from content that would otherwise join it
  const open = prevSpace ? ':br' : ' :br'
  return nextSpace ? open : `${open} `
}
