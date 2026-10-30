import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes } from '../attributes.ts'
import { pickFence } from '../fence.ts'
import { component } from './component.ts'

export function mermaid(node: ElementNode, state: State, parent?: ElementNode): string | Promise<string> {
  const [_, attributes] = node

  // The mermaid plugin always sets `content`; without it this is a `:mermaid` component.
  if (typeof attributes.content !== 'string') {
    return component(node, state, parent)
  }

  const { content, ...rest } = attributes

  const attrs = comarkAttributes(rest)
  // Parsed fence bodies keep one trailing newline — drop it so serialization
  // doesn't grow a blank line on every round trip.
  const body = String(content ?? '').replace(/\n$/, '')
  const fence = pickFence(body)

  return `${fence}mermaid${attrs ? ` ${attrs}` : ''}\n${body}\n${fence}${state.context.blockSeparator}`
}
