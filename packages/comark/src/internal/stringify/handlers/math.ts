import type { State } from '../types'
import type { ComarkElement } from '../../../ast/types'
import { textContent } from '../../../ast'

export function math(node: ComarkElement, state: State, parent?: ComarkElement) {
  const content = textContent(node)

  if (parent?.some((child, index) => index > 1 && typeof child === 'string')) {
    return `$$${content}$$`
  }

  return `$$\n${content}\n$$${state.context.blockSeparator}`
}
