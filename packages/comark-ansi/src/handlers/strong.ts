import type { NodeHandler } from 'comark/render'
import { BOLD, wrap } from '../utils/escape.ts'

export const strong: NodeHandler = async (node, state) => {
  return wrap(BOLD, await state.flow(node, state), Boolean(state.context.colors))
}
