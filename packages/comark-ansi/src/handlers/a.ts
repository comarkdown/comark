import type { NodeHandler } from 'comark/string'
import { DIM, RESET } from '../escape.ts'

export const a: NodeHandler = (node, state) => {
  const href = String(node[1].href || '')
  const content = state.flow(node, state)

  if (!state.context.colors || !href) {
    return href ? `${content} (${href})` : content
  }

  return content + ' ' + DIM + '(' + href + ')' + RESET
}
