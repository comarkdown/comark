import type { ANSINodeHandler } from '../types'
import { DIM, RESET } from '../escape'

export const a: ANSINodeHandler = (node, state) => {
  const href = String(node[1].href || '')
  const content = state.flow(node, state)

  if (!state.context.colors || !href) {
    return href ? `${content} (${href})` : content
  }

  return content + ' ' + DIM + '(' + href + ')' + RESET
}
