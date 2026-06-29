import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'
import { indent } from '../../../utils/index.ts'
import { comarkAttributes, userBlockAttrs } from '../attributes.ts'

export async function ol(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  // `start` is carried by the native numbering; IMPLICIT_ATTRS drops it from user attrs.
  const start = Number((node[1] as Record<string, unknown>).start)
  const order = Number.isInteger(start) && start >= 1 ? start : 1

  const revert = state.applyContext({ list: true, order, listIndent: 3 })

  let result = ''
  for (const child of children) {
    result += await state.one(child, state)
  }
  result = result.trim()

  state.applyContext(revert)

  // ol with user attrs round-trips via `::ol{attrs}\n1. …\n::` — the native
  // markdown list syntax has no slot for list-level attrs.
  const attrs = comarkAttributes(userBlockAttrs('ol', node[1] as Record<string, unknown>))
  if (attrs) {
    if (revert.list) {
      return '\n' + indent(`::ol${attrs}\n${result}\n::`, { width: (revert.listIndent as number) || 2 })
    }
    return `::ol${attrs}\n${result}\n::` + state.context.blockSeparator
  }

  if (revert.list) {
    result = '\n' + indent(result, { width: (revert.listIndent as number) || 2 })
  } else {
    result = result + state.context.blockSeparator
  }

  return result
}
