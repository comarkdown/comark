import type { State } from '../types'
import type { ComarkElement } from '../../../ast/types'
import { comarkAttributes } from '../attributes'

export function img(node: ComarkElement, _state: State) {
  const [_, attrs] = node
  const { title, src, alt, ...rest } = attrs

  const attrsString = Object.keys(rest).length > 0
    ? comarkAttributes(rest)
    : ''

  return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})${attrsString}`
}
