import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes } from '../attributes.ts'

export async function emphesis(node: ElementNode, state: State) {
  const [_, attrs, ...children] = node

  // Emphasis inside emphasis alternates `*` and `_`: `**foo**` would read back as strong.
  const marker = state.context.emphasisMarker === '*' ? '_' : '*'
  const revert = state.applyContext({ emphasisMarker: marker })

  let content = ''
  for (const child of children) {
    content += await state.one(child, state, node)
  }
  content = content.trim()

  state.applyContext(revert)

  const attrsString = Object.keys(attrs).length > 0 ? comarkAttributes(attrs) : ''

  return `${marker}${content}${marker}${attrsString}`
}
