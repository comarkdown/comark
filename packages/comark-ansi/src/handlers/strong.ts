import type { NodeHandler } from 'comark/render'
import { BOLD, wrap } from '../utils/escape.ts'

export const strong: NodeHandler = (node, state) => {
  return wrap(BOLD, state.flow(node, state), Boolean(state.context.colors))
}
