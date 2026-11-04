import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes } from '../attributes.ts'

// TODO: support title & attributes
export async function a(node: ElementNode, state: State) {
  const [_, attrs] = node

  // Links added by `heading-links` aren't part of the source
  if (attrs.$?.permalink === 'separate') return ''
  if (attrs.$?.permalink === 'wrap') return state.flow(node, state)

  const { href, ...rest } = attrs
  const attrsString = Object.keys(rest).length > 0 ? comarkAttributes(rest) : ''
  const content = await state.flow(node, state)

  if (content === href && !attrsString) {
    return `<${href}>`
  }

  return `[${content}](${href})${attrsString}`
}
