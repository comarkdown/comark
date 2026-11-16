import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes } from '../attributes.ts'
import { imageAlt, linkDestination, linkTitle } from '../link.ts'

export function img(node: ElementNode, _state: State) {
  const [_, attrs] = node
  const { title, src, alt = '', ...rest } = attrs

  const attrsString = Object.keys(rest).length > 0 ? comarkAttributes(rest) : ''

  const destination = linkDestination(src)
  const link = title
    ? `![${imageAlt(alt)}](${destination} "${linkTitle(title)}")`
    : `![${imageAlt(alt)}](${destination})`
  return `${link}${attrsString}`
}
