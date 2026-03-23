import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'

// h1, h2, h3, h4, h5, h6
export async function heading(node: ComarkElement, state: State) {
  const [tag] = node

  const level = Number(tag.slice(1))

  const content = await state.flow(node, state)

  return '#'.repeat(level) + ' ' + content + state.context.blockSeparator
}
