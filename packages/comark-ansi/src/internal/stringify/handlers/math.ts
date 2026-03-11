import type { ANSINodeHandler } from '../types'
import { textContent } from 'comark/ast'
import { MAGENTA, YELLOW, RESET } from '../escape'

export const math: ANSINodeHandler = (node, state, parent) => {
  const content = textContent(node).trim()
  const { colors } = state.context

  // Inline math: parent has string siblings alongside this node
  const isInline = parent?.some((child, index) => index > 1 && typeof child === 'string')

  if (isInline) {
    return colors ? YELLOW + '$' + content + '$' + RESET : `$${content}$`
  }

  // Block math
  return `$$\n${(colors ? MAGENTA + content + RESET : content)}\n$$` + '\n\n'
}
