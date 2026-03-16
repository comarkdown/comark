export * from 'comark/plugins/math'
export { default } from 'comark/plugins/math'

import type { NodeHandler } from 'comark/string'
import { textContent } from 'comark/ast'
import { MAGENTA, YELLOW, RESET } from '../escape.ts'

export const Math: NodeHandler = (node, state, parent) => {
  const content = textContent(node).trim()
  console.log({state})
  const { colors } = state.context

  // Inline math: parent has string siblings alongside this node
  const isInline = parent?.some((child, index) => index > 1 && typeof child === 'string')

  if (isInline) {
    return colors ? YELLOW + '$' + content + '$' + RESET : `$${content}$`
  }

  // Block math
  return `$$\n${(colors ? MAGENTA + content + RESET : content)}\n$$` + '\n\n'
}
