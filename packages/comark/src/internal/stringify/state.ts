import { handlers } from './handlers/index.ts'
import type { State, Context } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'
import { pascalCase } from '../../utils/index.ts'

/**
 * Render a single node
 * @param node - The node to render
 * @param state - The state of the renderer
 * @param parent - The parent node
 * @returns The rendered node
 */
export async function one(node: ComarkNode, state: State, parent?: ComarkElement): Promise<string> {
  if (typeof node === 'string') {
    if (state.context.html) {
      return escapeHtml(node)
    }
    return node
  }

  if (node[0] === null) {
    return await state.handlers.comment(node as unknown as ComarkElement, state)
  }

  const userHandler = state.context.handlers[node[0] as string] || state.context.handlers[pascalCase(node[0] as string)]
  if (userHandler) {
    return await userHandler(node, state, parent)
  }

  if (state.context.html || node[1].$?.html === 1) {
    return await state.handlers.html(node, state, parent)
  }

  const nodeHandler = state.handlers[node[0] as string]
  if (nodeHandler) {
    return await nodeHandler(node, state, parent)
  }

  return state.context.format === 'markdown/comark'
    ? await state.handlers.mdc(node, state, parent)
    : await state.handlers.html(node, state, parent)
}

export async function flow(node: ComarkElement, state: State, parent?: ComarkElement): Promise<string> {
  const children = node.slice(2) as ComarkElement[]
  let result = ''
  for (const child of children) {
    result += await one(child, state, parent || node)
  }
  return result
}

export function createState(ctx: Partial<Context> = {}): State {
  const context = {
    ...ctx,
    blockSeparator: ctx.blockSeparator || '\n\n',
    format: ctx.format || 'markdown/comark',
    handlers: ctx.handlers || {}, // user defined node handlers
    blockAttributesStyle: ctx.blockAttributesStyle || 'codeblock',
    // Enable html mode for text/html format
    html: ctx.format === 'text/html',
  } as Context

  const state = {
    handlers,
    context,
    one,
    flow,
    data: ctx.data || {},
    render: async (input: ComarkNode[] | ComarkElement) => {
      if (Array.isArray(input) && typeof input[0] === 'string' && input.length > 1) {
        return state.one(input as ComarkElement, state)
      }

      let result = ''
      for (const child of (input as ComarkNode[])) {
        result += await state.one(child, state)
      }
      return result
    },
    applyContext: (edit: Record<string, unknown>) => {
      const revert = {} as Record<string, unknown>

      for (const [key, value] of Object.entries(edit)) {
        revert[key] = context[key]
        context[key] = value
      }

      return revert
    },
  }

  return state
}

export const state: State = {
  handlers,
  data: {},
  context: {
    blockSeparator: '\n\n',
    format: 'markdown/comark',
    handlers: {}, // user defined node handlers
    blockAttributesStyle: 'codeblock',
  },
  flow,
  one,
  render: async (input: ComarkNode[] | ComarkElement) => {
    if (typeof input === 'string') {
      return input
    }

    if (Array.isArray(input) && typeof input[0] === 'string') {
      return one(input as ComarkElement, state)
    }

    let result = ''
    for (const child of (input as ComarkNode[])) {
      result += await one(child, state)
    }
    return result
  },
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
