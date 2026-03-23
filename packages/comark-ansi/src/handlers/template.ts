import type { NodeHandler } from 'comark/render'

export const template: NodeHandler = async (node, state) => {
  return (await state.flow(node, state)).trim() + '\n\n'
}
