import type { NodeHandler } from 'comark/string'
import { ITALIC, wrap } from '../escape.ts'

export const em: NodeHandler = (node, state) => {
  return wrap(ITALIC, state.flow(node, state), Boolean(state.context.colors))
}
