import type { NodeHandler } from 'comark/render'
import { STRIKETHROUGH, wrap } from '../utils/escape.ts'

export const del: NodeHandler = async (node, state) => {
  return wrap(STRIKETHROUGH, await state.flow(node, state), Boolean(state.context.colors))
}
