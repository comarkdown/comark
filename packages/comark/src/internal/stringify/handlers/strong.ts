import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'
import { comarkAttributes } from '../attributes.ts'

export async function strong(node: ComarkElement, state: State) {
  const [_, attrs, ...children] = node

  let content = ''
  for (const child of children) {
    content += await state.one(child, state, node)
  }
  content = content.trim()

  const attrsString = Object.keys(attrs).length > 0 ? comarkAttributes(attrs) : ''

  return `**${content}**${attrsString}`
}
