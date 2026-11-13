import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes } from '../attributes.ts'
import { isAutolinkSafe, linkDestination } from '../link.ts'

// TODO: support title & attributes
export async function a(node: ElementNode, state: State, parent?: ElementNode) {
  const [_, attrs] = node

  // Links added by `heading-links` aren't part of the source
  if (attrs.$?.permalink === 'separate') return ''
  if (attrs.$?.permalink === 'wrap') return state.flow(node, state, parent)

  const { href, ...rest } = attrs
  const attrsString = Object.keys(rest).length > 0 ? comarkAttributes(rest) : ''
  const content = await state.flow(node, state)

  if (content === href && !attrsString && isAutolinkSafe(href)) {
    return `<${href}>`
  }

  return `[${content}](${linkDestination(href)})${attrsString}`
}
