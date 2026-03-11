import type { ANSINodeHandler } from '../types'
import { DIM, wrap } from '../escape'

export const hr: ANSINodeHandler = (_node, state) => {
  const line = '─'.repeat(state.context.width)
  return wrap(DIM, line, state.context.colors) + '\n\n'
}
