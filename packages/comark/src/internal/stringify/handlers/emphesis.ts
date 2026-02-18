import type { State } from '../types'
import type { ComarkElement } from '../../../ast/types'
import { comarkAttributes } from '../attributes'

export function emphesis(node: ComarkElement, state: State) {
  const [_, attrs, ...children] = node

  const content = children.map(child => state.one(child, state))
    .join('')
    .trim()

  const attrsString = Object.keys(attrs).length > 0
    ? comarkAttributes(attrs)
    : ''

  return `*${content}*${attrsString}`
}
