import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'
import { comarkAttributes } from '../attributes'

export function strong(node: ComarkElement, state: State) {
  const [_, attrs, ...children] = node

  const content = children.map(child => state.one(child, state, node))
    .join('')
    .trim()

  const attrsString = Object.keys(attrs).length > 0
    ? comarkAttributes(attrs)
    : ''

  return `**${content}**${attrsString}`
}
