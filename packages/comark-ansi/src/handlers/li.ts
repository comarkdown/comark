import type { NodeHandler } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'

export const li: NodeHandler = async (node, state) => {
  const children = node.slice(2) as ComarkNode[]
  const order = state.context.order

  let prefix = order ? `${order}. ` : '• '

  // task list item
  const className = String((node[1].className as string[])?.join?.(' ') ?? node[1].class ?? '')
  if (className.includes('task-list-item')) {
    const input = children.shift() as ComarkElement
    prefix += (input[1].checked || input[1][':checked']) ? '[x] ' : '[ ] '
  }

  let content = ''
  for (const child of children) {
    content += await state.one(child, state, node)
  }
  content = content.trim()

  if (typeof order === 'number') {
    state.applyContext({ order: order + 1 })
  }

  return `${prefix}${content}\n`
}
