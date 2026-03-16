import type { NodeHandler } from 'comark/string'
import { STRIKETHROUGH, wrap } from '../escape.ts'

export const del: NodeHandler = (node, state) => {
  return wrap(STRIKETHROUGH, state.flow(node, state), Boolean(state.context.colors))
}
