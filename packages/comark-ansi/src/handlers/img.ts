import type { NodeHandler } from 'comark/render'
import { resolveAttribute } from 'comark/render'
import { DIM, wrap } from '../utils/escape.ts'

export const img: NodeHandler = (node, state) => {
  const alt = String(resolveAttribute(node[1], state.renderData, 'alt') || 'image')
  return wrap(DIM, `[image: ${alt}]`, Boolean(state.context.colors))
}
