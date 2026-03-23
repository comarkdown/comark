import type { NodeHandler } from 'comark/render'
import { DIM, RESET } from '../utils/escape.ts'

export const a: NodeHandler = async (node, state) => {
  const href = String(node[1].href || '')
  const content = await state.flow(node, state)

  if (!state.context.colors || !href) {
    return href ? `${content} (${href})` : content
  }

  return content + ' ' + DIM + '(' + href + ')' + RESET
}
