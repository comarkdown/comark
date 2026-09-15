import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes, userBlockAttrs } from '../attributes.ts'
import { textContent } from '../../../utils/index.ts'

export function code(node: ElementNode, _state: State) {
  const [_, attributes] = node
  // The shiki plugin takes over the `class` of highlighted inline code, so
  // strip its portion back off instead of echoing `.shiki` into the markdown.
  const attrs = userBlockAttrs('code', attributes as Record<string, unknown>)
  const attrsString = Object.keys(attrs).length > 0 ? comarkAttributes(attrs) : ''
  const content = textContent(node)
  const fence = content.includes('`') ? '``' : '`'

  return `${fence}${content}${fence}${attrsString}`
}
