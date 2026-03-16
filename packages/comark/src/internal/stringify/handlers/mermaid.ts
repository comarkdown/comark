import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'
import { comarkAttributes } from '../attributes'

const fence = '```'
export function mermaid(node: ComarkElement, state: State) {
  const [_, attributes] = node

  const { content, ...rest } = attributes

  const attrs = comarkAttributes(rest)

  return `${fence}mermaid${attrs ? ` ${attrs}` : ''}\n${content}\n${fence}${state.context.blockSeparator}`
}
