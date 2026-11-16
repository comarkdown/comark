import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { textContent } from '../../../utils/index.ts'
import { component } from './component.ts'

export function math(node: ElementNode, state: State, parent?: ElementNode): string | Promise<string> {
  const className = node[1].class
  const classes = typeof className === 'string' ? className.split(' ') : []
  // The math plugin always sets `class="math …"` and `content`, which the Math
  // components also need. With neither, this is a `:math` component.
  if (!classes.includes('math') && typeof node[1].content !== 'string') {
    return component(node, state, parent)
  }

  const content = textContent(node)
  const hasInlineClass = classes.includes('inline')
  const hasBlockClass = classes.includes('block')
  const hasInlineSiblings = parent?.some((child, index) => index > 1 && typeof child === 'string') ?? false
  const isInline = hasInlineClass || (!hasBlockClass && hasInlineSiblings)
  const markup = node[1].$?.markup

  if (isInline) {
    if (markup === '\\(') return `\\(${content}\\)`
    if (markup === '\\[') return `\\[${content}\\]`
    return `$${content}$`
  }

  if (markup === '\\[') return `\\[\n${content}\n\\]${state.context.blockSeparator}`
  return `$$\n${content}\n$$${state.context.blockSeparator}`
}
