import { handlers as defaultHandlers } from './handlers/index.ts'
import { createState as createRuntimeState, one, flow } from './runtime.ts'
import type { CreateContext, ElementNode, Node, NodeRenderData, State } from '../../types.ts'

export { one, flow } from './runtime.ts'

export function createState(ctx: Partial<CreateContext> = {}): State {
  return createRuntimeState(defaultHandlers, ctx)
}

export const state: State = {
  handlers: defaultHandlers,
  conditionalHandlers: [],
  data: {},
  renderData: { frontmatter: {}, meta: {}, data: {}, props: {} } as NodeRenderData,
  context: {
    blockSeparator: '\n\n',
    format: 'markdown/comark',
    handlers: {}, // user defined node handlers
    conditionalHandlers: [], // user defined conditional handlers
    blockAttributesStyle: 'codeblock',
  },
  flow,
  one,
  render: async (input: Node[] | ElementNode) => {
    if (typeof input === 'string') {
      return input
    }

    if (Array.isArray(input) && typeof input[0] === 'string') {
      return one(input as ElementNode, state)
    }

    let result = ''
    for (const child of input as Node[]) {
      result += await one(child, state, undefined, result === '' || result.endsWith('\n'))
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
