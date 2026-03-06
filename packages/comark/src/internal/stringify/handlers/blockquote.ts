import type { State } from '../types'
import type { ComarkElement, ComarkNode } from '../../../ast/types'

export function blockquote(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  const content = children.map(child => state.one(child, state, node))
    .join('')
    .trim()
    .split('\n')
    .map(line => line ? `> ${line}` : '>')
    .join('\n')

  if (node[1].as) {
    return `> [!${String(node[1].as).toUpperCase()}]\n`
      + content
      + state.context.blockSeparator
  }

  return content + state.context.blockSeparator
}
