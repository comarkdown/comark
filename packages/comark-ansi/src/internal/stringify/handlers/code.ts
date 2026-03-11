import type { ANSINodeHandler } from '../types'
import { CYAN, wrap } from '../escape'
import { textContent } from 'comark/ast'

export const code: ANSINodeHandler = (node, state) => {
  return wrap(CYAN, textContent(node), state.context.colors)
}
