import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'
import { indent } from '../indent.ts'

// Block elements that need explicit indentation in list items.
// Note: ol/ul are handled by their own handlers which manage indentation via listIndent context.
const blockElements = new Set(['pre', 'blockquote', 'table'])

export async function li(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  const order = state.context.order
  let prefix = order ? `${order}. ` : '- '

  const className =
    (node[1].className as string) && Array.isArray(node[1].className)
      ? node[1].className.join(' ')
      : String(node[1].className || node[1].class)

  const taskList = className.includes('task-list-item')

  if (taskList) {
    const input = children.shift() as ComarkElement
    prefix += input[1].checked || input[1][':checked'] ? '[x] ' : '[ ] '
  }

  const prefixWidth = prefix.length
  let result = ''

  for (const child of children) {
    const rendered = await state.one(child, state, node)

    if (Array.isArray(child) && blockElements.has(child[0] as string)) {
      // Block-level child: put on its own line and indent to align with list prefix
      const indented = indent(rendered, { width: prefixWidth })
      result = result.trimEnd() + '\n' + indented.trimEnd() + '\n'
    } else {
      result += rendered
    }
  }
  result = result.trim()

  if (!order) {
    result = escapeLeadingNumberDot(result)
  }

  if (order) {
    state.applyContext({ order: order + 1 })
  }

  return `${prefix}${result}\n`
}

function escapeLeadingNumberDot(str: string): string {
  if (str.length === 0) return str

  const len = str.length
  const firstChar = str.charCodeAt(0)
  if (firstChar < 48 || firstChar > 57) return str // Not a digit

  let i = 1
  for (; i < len; i++) {
    const code = str.charCodeAt(i)
    if (code < 48 || code > 57) break
  }

  if (i < len && str[i] === '.') {
    return str.slice(0, i) + '\\.' + str.slice(i + 1)
  }

  return str
}
