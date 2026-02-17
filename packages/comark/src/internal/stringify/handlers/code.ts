import type { State } from '../types'
import type { ComarkElement } from '../../../ast/types'
import { comarkAttributes } from '../attributes'
import { textContent } from '../../../ast'

export function code(node: ComarkElement, _state: State) {
  const [_, attrs] = node
  const attrsString = Object.keys(attrs).length > 0
    ? comarkAttributes(attrs)
    : ''
  const content = textContent(node)
  const fence = content.includes('`') ? '``' : '`'

  return `${fence}${content}${fence}${attrsString}`
}
