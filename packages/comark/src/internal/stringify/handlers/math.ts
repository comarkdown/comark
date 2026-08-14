import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { textContent } from '../../../utils/index.ts'

export function math(node: ElementNode, state: State, parent?: ElementNode): string {
  const content = textContent(node)
  const className = node[1].class
  const classes = typeof className === 'string' ? className.split(' ') : []
  const hasInlineClass = classes.includes('inline')
  const hasBlockClass = classes.includes('block')
  const hasInlineSiblings = parent?.some((child, index) => index > 1 && typeof child === 'string') ?? false
  const isInline = hasInlineClass || (!hasBlockClass && hasInlineSiblings)

  if (isInline) {
    return `$${content}$`
  }

  return `$$\n${content}\n$$${state.context.blockSeparator}`
}
