import type { NodeHandler } from 'comark/render'
import { textContent } from 'comark/utils'
import { MAGENTA, YELLOW, RESET } from '../utils/escape.ts'

export * from 'comark/plugins/math'
export { default } from 'comark/plugins/math'

export const Math: NodeHandler = (node, state, parent) => {
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
