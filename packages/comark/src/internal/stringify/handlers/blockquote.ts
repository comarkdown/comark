import type { State } from '../types'
import type { ComarkElement, ComarkNode } from '../../../ast/types'

export function blockquote(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  const content = children.map(child => state.one(child, state))
    .join('')
    .trim()
    .split('\n')
    .map(line => `> ${line}`)
    .join('\n')

  return content + state.context.blockSeparator
}
