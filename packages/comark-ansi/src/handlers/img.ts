import type { NodeHandler } from 'comark/render'
import { DIM, wrap } from '../utils/escape.ts'

export const img: NodeHandler = (node, state) => {
  const alt = String(node[1].alt || 'image')
  return wrap(DIM, `[image: ${alt}]`, Boolean(state.context.colors))
}
