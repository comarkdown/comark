import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes } from '../attributes.ts'
import { pickFence } from '../fence.ts'

export function mermaid(node: ElementNode, state: State) {
  const [_, attributes] = node

  const { content, ...rest } = attributes

  const attrs = comarkAttributes(rest)
  // Parsed fence bodies keep one trailing newline — drop it so serialization
  // doesn't grow a blank line on every round trip.
  const body = String(content ?? '').replace(/\n$/, '')
  const fence = pickFence(body)

  return `${fence}mermaid${attrs ? ` ${attrs}` : ''}\n${body}\n${fence}${state.context.blockSeparator}`
}
