import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'
import { textContent } from 'comark/utils'

export function math(node: ComarkElement, state: State, parent?: ComarkElement) {
  const content = textContent(node)

  if (parent?.some((child, index) => index > 1 && typeof child === 'string')) {
    return `$$${content}$$`
  }

  return `$$\n${content}\n$$${state.context.blockSeparator}`
}
