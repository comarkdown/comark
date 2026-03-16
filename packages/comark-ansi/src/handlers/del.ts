import type { NodeHandler } from 'comark/render'
import { STRIKETHROUGH, wrap } from '../utils/escape.ts'

export const del: NodeHandler = (node, state) => {
  return wrap(STRIKETHROUGH, state.flow(node, state), Boolean(state.context.colors))
}
