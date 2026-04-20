import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'
import { indent } from '../indent.ts'

export async function ul(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  const revert = state.applyContext({ list: true, order: false, listIndent: 2 })

  let result = ''
  for (const child of children) {
    result += await state.one(child, state)
  }
  result = result.trim()

  if (revert.list) {
    result = '\n' + indent(result, { width: revert.listIndent as number || 2 })
  }
  else {
    result = result + state.context.blockSeparator
  }

  state.applyContext(revert)

  return result
}
