import type { NodeHandler } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'
import { indent } from 'comark/utils'

// Block elements that need explicit indentation in list items.
// Note: ol/ul are handled by their own handlers which manage indentation via listIndent context.
const blockElements = new Set(['pre', 'blockquote', 'table'])

export const li: NodeHandler = async (node, state) => {
  const children = node.slice(2) as ComarkNode[]
  const order = state.context.order

  let prefix = order ? `${order}. ` : '• '

  // task list item
  const className = String((node[1].className as string[])?.join?.(' ') ?? node[1].class ?? '')
  if (className.includes('task-list-item')) {
    const input = children.shift() as ComarkElement
    prefix += input[1].checked || input[1][':checked'] ? '[x] ' : '[ ] '
  }

  const prefixWidth = prefix.length
  let result = ''
  for (const child of children) {
    const rendered = await state.one(child, state, node)
    if (result && Array.isArray(child)) {
      if (blockElements.has(child[0] as string)) {
        // Block-level child: put on its own line and indent to align with list prefix
        const indented = indent(rendered, { width: prefixWidth })
        result = result.trimEnd() + '\n' + indented.trimEnd() + '\n'
        continue
      }

      if (child[0] === 'p') {
        const indented = indent(rendered, { width: prefixWidth })
        result = result.trimEnd() + '\n\n' + indented.trimEnd() + '\n'
        continue
      }
    }
    result += rendered
  }
  result = result.trim()

  if (typeof order === 'number') {
    state.applyContext({ order: order + 1 })
  }

  return `${prefix}${result}\n`
}
