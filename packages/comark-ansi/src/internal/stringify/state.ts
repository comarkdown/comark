import type { ANSIState, ANSIContext, ANSINodeHandler } from './types'
import type { ComarkElement, ComarkNode } from 'comark/ast'
import { handlers } from './handlers'

export function one(node: ComarkNode, state: ANSIState, parent?: ComarkElement): string {
  if (typeof node === 'string') return node

  // HTML comment
  if (node[0] === null) {
    return state.handlers.comment(node as unknown as ComarkElement, state)
  }

  // User-provided component override
  const userHandler = state.context.handlers[node[0] as string]
  if (userHandler) return userHandler(node, state, parent)

  // Built-in handler
  const nodeHandler = state.handlers[node[0] as string]
  if (nodeHandler) return nodeHandler(node, state, parent)

  // Unknown tag / MDC component — render children only
  return flow(node, state)
}

export function flow(node: ComarkElement, state: ANSIState): string {
  const children = node.slice(2) as ComarkNode[]
  return children.map(child => one(child, state, node)).join('')
}

export function createState(ctx: { colors: boolean, width: number, handlers: Record<string, ANSINodeHandler> }): ANSIState {
  const context: ANSIContext = {
    ...ctx,
    list: false,
    order: false,
    blockquoteDepth: 0,
  }

  return {
    handlers,
    context,
    flow,
    one,
    applyContext(edit: Record<string, unknown>) {
      const revert: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(edit)) {
        revert[key] = context[key]
        context[key] = value
      }
      return revert
    },
  }
}
