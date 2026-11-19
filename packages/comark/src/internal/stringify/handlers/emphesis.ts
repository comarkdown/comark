import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes } from '../attributes.ts'
import { sourceNode } from '../state.ts'

export async function emphesis(node: ElementNode, state: State, parent?: ElementNode) {
  const [_, attrs, ...children] = node

  // Emphasis that opens or closes its parent emphasis alternates `*` and `_`:
  // `**foo**` would read back as strong. Elsewhere it keeps `*`, since `_`
  // cannot open or close inside a word (`*foo *bar*baz*`, `_x [a*b*](/u) y_`).
  const source = sourceNode(node)
  const atEdge =
    parent !== undefined && parent[0] === 'em' && (parent[2] === source || parent[parent.length - 1] === source)
  const marker = state.context.emphasisMarker === '*' && atEdge ? '_' : '*'
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
