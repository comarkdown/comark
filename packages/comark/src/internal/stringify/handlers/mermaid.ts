import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes } from '../attributes.ts'

const fence = '```'
export function mermaid(node: ElementNode, state: State) {
  const [_, attributes] = node

  const { content, ...rest } = attributes

  const attrs = comarkAttributes(rest)

  return `${fence}mermaid${attrs ? ` ${attrs}` : ''}\n${content}\n${fence}${state.context.blockSeparator}`
}
