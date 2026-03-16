import type { NodeHandler } from 'comark/string'
import type { ComarkNode } from 'comark/ast'

export const ul: NodeHandler = (node, state) => {
  const children = node.slice(2) as ComarkNode[]
  const revert = state.applyContext({ list: true, order: false })

  let result = children.map(child => state.one(child, state, node)).join('').trimEnd()

  if (revert.list) {
    result = '\n' + result.split('\n').map(line => '  ' + line).join('\n')
  }
  else {
    result = result + '\n\n'
  }

  state.applyContext(revert)
  return result
}
