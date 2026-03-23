import type { NodeHandler } from 'comark/render'
import { ITALIC, wrap } from '../utils/escape.ts'

export const em: NodeHandler = async (node, state) => {
  return wrap(ITALIC, await state.flow(node, state), Boolean(state.context.colors))
}
