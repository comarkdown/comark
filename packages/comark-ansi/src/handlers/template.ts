import type { NodeHandler } from 'comark/string'

export const template: NodeHandler = (node, state) => {
  return state.flow(node, state).trim() + '\n\n'
}
