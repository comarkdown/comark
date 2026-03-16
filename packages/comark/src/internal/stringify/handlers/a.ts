import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'
import { comarkAttributes } from '../attributes'

// TODO: support title & attributes
export function a(node: ComarkElement, state: State) {
  const [_, attrs] = node

  const { href, ...rest } = attrs
  const attrsString = Object.keys(rest).length > 0
    ? comarkAttributes(rest)
    : ''
  const content = state.flow(node, state)

  return `[${content}](${href})${attrsString}`
}
