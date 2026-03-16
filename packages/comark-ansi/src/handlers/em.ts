import type { NodeHandler } from 'comark/render'
import { ITALIC, wrap } from '../utils/escape.ts'

export const em: NodeHandler = (node, state) => {
  return wrap(ITALIC, state.flow(node, state), Boolean(state.context.colors))
}
