import type { ANSINodeHandler } from '../types'
import { STRIKETHROUGH, wrap } from '../escape'

export const del: ANSINodeHandler = (node, state) => {
  return wrap(STRIKETHROUGH, state.flow(node, state), state.context.colors)
}
