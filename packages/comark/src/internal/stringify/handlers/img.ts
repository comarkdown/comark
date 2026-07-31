import type { State } from 'comark/render'
import type { MarkdownElement } from 'comark'
import { comarkAttributes } from '../attributes.ts'

export function img(node: MarkdownElement, _state: State) {
  const [_, attrs] = node
  const { title, src, alt = '', ...rest } = attrs

  const attrsString = Object.keys(rest).length > 0 ? comarkAttributes(rest) : ''

  const link = title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
  return `${link}${attrsString}`
}
