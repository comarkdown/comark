import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { textContent } from '../../../utils/index.ts'

export function math(node: ElementNode, state: State, parent?: ElementNode) {
  const content = textContent(node)

  if (parent?.some((child, index) => index > 1 && typeof child === 'string')) {
    return `$$${content}$$`
  }

  return `$$\n${content}\n$$${state.context.blockSeparator}`
}
