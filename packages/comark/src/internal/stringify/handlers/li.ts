import type { State } from '../types'
import type { ComarkElement, ComarkNode } from '../../../ast/types'

export function li(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  const order = state.context.order
  let prefix = order ? `${order}. ` : '- '

  const className = (node[1].className as string) && Array.isArray(node[1].className)
    ? node[1].className.join(' ')
    : String(node[1].className || node[1].class)

  const taskList = className.includes('task-list-item')

  if (taskList) {
    const input = children.shift() as ComarkElement
    prefix += input[1].checked || input[1][':checked'] ? '[x] ' : '[ ] '
  }

  let result = children.map(child => state.one(child, state)).join('').trim()

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
