import type { NodeHandler } from 'comark/render'
import type { ComarkNode } from 'comark'

export const ul: NodeHandler = async (node, state) => {
  const children = node.slice(2) as ComarkNode[]
  const revert = state.applyContext({ list: true, order: false })

  let result = ''
  for (const child of children) {
    result += await state.one(child, state, node)
  }
  result = result.trimEnd()

  if (revert.list) {
    result = '\n' + result.split('\n').map(line => '  ' + line).join('\n')
  }
  else {
    result = result + '\n\n'
  }

  state.applyContext(revert)
  return result
}
