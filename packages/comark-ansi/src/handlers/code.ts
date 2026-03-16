import type { NodeHandler } from 'comark/string'
import { CYAN, wrap } from '../escape.ts'
import { textContent } from 'comark/ast'

export const code: NodeHandler = (node, state) => {
  return wrap(CYAN, textContent(node), Boolean(state.context.colors))
}
