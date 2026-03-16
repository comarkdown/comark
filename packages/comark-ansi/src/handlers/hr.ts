import type { NodeHandler } from 'comark/string'
import { DIM, wrap } from '../escape.ts'

export const hr: NodeHandler = (_node, state) => {
  const line = '─'.repeat(Number(state.context.width))
  return wrap(DIM, line, Boolean(state.context.colors)) + '\n\n'
}
