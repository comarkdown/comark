import type { ANSINodeHandler } from '../types'
import { ITALIC, wrap } from '../escape'

export const em: ANSINodeHandler = (node, state) => {
  return wrap(ITALIC, state.flow(node, state), state.context.colors)
}
