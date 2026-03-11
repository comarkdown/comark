import type { ANSINodeHandler } from '../types'
import { BOLD, wrap } from '../escape'

export const strong: ANSINodeHandler = (node, state) => {
  return wrap(BOLD, state.flow(node, state), state.context.colors)
}
