import type { NodeHandler } from 'comark/string'
import { BOLD, wrap } from '../escape.ts'

export const strong: NodeHandler = (node, state) => {
  return wrap(BOLD, state.flow(node, state), Boolean(state.context.colors))
}
