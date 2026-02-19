import { handlers } from './handlers'
import type { State, Context } from './types'
import type { ComarkElement, ComarkNode } from '../../ast/types'

/**
 * Render a single node
 * @param node - The node to render
 * @param state - The state of the renderer
 * @param parent - The parent node
 * @returns The rendered node
 */
export function one(node: ComarkNode, state: State, parent?: ComarkElement) {
  if (typeof node === 'string') {
    if (state.context.html) {
      return escapeHtml(node)
    }
    return node
  }

  const userHandler = state.context.handlers[node[0] as string]
  if (userHandler) {
    return userHandler(node, state, parent)
  }

  if (state.context.html) {
    return state.handlers.html(node, state, parent)
  }

  const nodeHandler = state.handlers[node[0] as string]
  if (nodeHandler) {
    return nodeHandler(node, state, parent)
  }

  return state.context.format === 'markdown/mdc'
    ? state.handlers.mdc(node, state, parent)
    : state.handlers.html(node, state, parent)
}

export function flow(node: ComarkElement, state: State, parent?: ComarkElement) {
  const children = node.slice(2) as ComarkElement[]

  let result = ''
  for (const child of children) {
    result += one(child, state, parent || node)
  }

  return result
}

export function createState(ctx: Record<string, unknown> = {}): State {
  const context = {
    blockSeparator: '\n\n',
    format: 'markdown/mdc',
    handlers: {}, // user defined node handlers
    ...ctx,
    // Enable html mode for text/html format
    html: ctx.format === 'text/html',
  } as Context

  return {
    handlers,
    context,
    flow,
    one,
    applyContext: (edit: Record<string, unknown>) => {
      const revert = {} as Record<string, unknown>

      for (const [key, value] of Object.entries(edit)) {
        revert[key] = context[key]
        context[key] = value
      }

      return revert
    },
  }
}

export const state: State = {
  handlers,
  context: {
    blockSeparator: '\n\n',
    format: 'markdown/mdc',
    handlers: {}, // user defined node handlers
  },
  flow,
  one,
  applyContext: (edit: Record<string, unknown>) => {
    const revert = {} as Record<string, unknown>

    for (const [key, value] of Object.entries(edit)) {
      revert[key] = state.context[key]
      state.context[key] = value
    }

    return revert
  },
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '&amp;': '&',
  }
  return text.replace(/[<>]/g, char => map[char])
}
