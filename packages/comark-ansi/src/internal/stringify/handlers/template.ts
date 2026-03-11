import type { ANSINodeHandler } from '../types'

export const template: ANSINodeHandler = (node, state) => {
  return state.flow(node, state).trim() + '\n\n'
}
