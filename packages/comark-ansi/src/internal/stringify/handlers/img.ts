import type { ANSINodeHandler } from '../types'
import { DIM, wrap } from '../escape'

export const img: ANSINodeHandler = (node, state) => {
  const alt = String(node[1].alt || 'image')
  return wrap(DIM, `[image: ${alt}]`, state.context.colors)
}
