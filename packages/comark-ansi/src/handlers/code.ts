import type { NodeHandler } from 'comark/render'
import { CYAN, wrap } from '../utils/escape.ts'
import { textContent } from 'comark/utils'

export const code: NodeHandler = (node, state) => {
  return wrap(CYAN, textContent(node), Boolean(state.context.colors))
}
