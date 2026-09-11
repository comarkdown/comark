import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes, userBlockAttrs } from '../attributes.ts'
import { textContent } from '../../../utils/index.ts'

export function code(node: ElementNode, _state: State) {
  const [_, attributes] = node
  // The shiki plugin owns the `class` of highlighted inline code and records the
  // author's own class in `$`, so the node round-trips as `` `text`{lang=…} ``
  // instead of leaking `.shiki.shiki-themes…`.
  const attrs = userBlockAttrs('code', attributes as Record<string, unknown>)
  const attrsString = Object.keys(attrs).length > 0 ? comarkAttributes(attrs) : ''
  const content = textContent(node)
  const fence = content.includes('`') ? '``' : '`'

  return `${fence}${content}${fence}${attrsString}`
}
