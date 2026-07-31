import type { State } from 'comark/render'
import type { MarkdownElement } from 'comark'
import { comarkAttributes } from '../attributes.ts'

export async function strong(node: MarkdownElement, state: State) {
  const [_, attrs, ...children] = node

  let content = ''
  for (const child of children) {
    content += await state.one(child, state, node)
  }
  content = content.trim()

  const attrsString = Object.keys(attrs).length > 0 ? comarkAttributes(attrs) : ''

  return `**${content}**${attrsString}`
}
