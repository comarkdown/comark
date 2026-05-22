import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'
import { indent } from '../../../utils/index.ts'
import { comarkAttributes, userBlockAttrs } from '../attributes.ts'

export async function ul(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  const revert = state.applyContext({ list: true, order: false, listIndent: 2 })

  let result = ''
  for (const child of children) {
    result += await state.one(child, state)
  }
  result = result.trim()

  state.applyContext(revert)

  // ul with user attrs round-trips via `::ul{attrs}\n- …\n::` — the native
  // markdown list syntax has no slot for list-level attrs.
  const attrs = comarkAttributes(userBlockAttrs('ul', node[1] as Record<string, unknown>))
  if (attrs) {
    if (revert.list) {
      return '\n' + indent(`::ul${attrs}\n${result}\n::`, { width: (revert.listIndent as number) || 2 })
    }
    return `::ul${attrs}\n${result}\n::` + state.context.blockSeparator
  }

  if (revert.list) {
    result = '\n' + indent(result, { width: (revert.listIndent as number) || 2 })
  } else {
    result = result + state.context.blockSeparator
  }

  return result
}
