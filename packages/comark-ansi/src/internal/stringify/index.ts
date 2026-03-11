import type { ComarkTree } from 'comark/ast'
import type { ANSINodeHandler } from './types'
import { createState, one } from './state'

export interface ANSIStringifyOptions {
  colors: boolean
  width: number
  handlers: Record<string, ANSINodeHandler>
}

export function ansiStringify(tree: ComarkTree, options: ANSIStringifyOptions): string {
  const state = createState(options)
  return tree.nodes.map(node => one(node, state)).join('').trim() + '\n'
}
