import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'
import { comarkAttributes } from '../attributes.ts'

// h1, h2, h3, h4, h5, h6
export async function heading(node: ComarkElement, state: State) {
  const [tag] = node

  const level = Number(tag.slice(1))

  const content = await state.flow(node, state)

  // The auto-generated id is implicit in `# Heading` markdown — don't echo it.
  const { id: _id, ...rest } = node[1] as Record<string, unknown>
  const attrs = comarkAttributes(rest)
  const suffix = attrs ? ` ${attrs}` : ''

  return '#'.repeat(level) + ' ' + content + suffix + state.context.blockSeparator
}
