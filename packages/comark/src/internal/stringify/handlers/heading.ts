import type { State } from 'comark/render'
import type { ElementNode, HeadingIdsOption } from 'comark'
import { textContent } from '../../../utils/index.ts'
import { createHeadingIdTracker, nextHeadingId, type HeadingIdTracker } from '../../heading-id.ts'
import { comarkAttributes } from '../attributes.ts'

// Replays the parser's id generation across one render so each heading's
// implicit id is known, keyed by render state (`null` when ids are disabled).
const trackers = new WeakMap<State, HeadingIdTracker | null>()

function autoHeadingId(node: ElementNode, level: number, state: State): string | undefined {
  let tracker = trackers.get(state)
  if (tracker === undefined) {
    tracker = createHeadingIdTracker(state.context.headingIds as HeadingIdsOption | undefined) ?? null
    trackers.set(state, tracker)
  }
  if (!tracker) return undefined
  const text = node
    .slice(2)
    .map((child) => textContent(child as ElementNode))
    .join('')
  return nextHeadingId(text, level, tracker)
}

// h1, h2, h3, h4, h5, h6
export async function heading(node: ElementNode, state: State) {
  const [tag] = node

  const level = Number(tag.slice(1))

  const content = await state.flow(node, state)

  // The auto-generated id is implicit in `# Heading` markdown — only echo a custom one.
  const { id, ...rest } = node[1] as Record<string, unknown>
  const autoId = autoHeadingId(node, level, state)
  const attrs = comarkAttributes(id === undefined || id === autoId ? rest : { id, ...rest })
  const suffix = attrs ? ` ${attrs}` : ''

  return '#'.repeat(level) + ' ' + content + suffix + state.context.blockSeparator
}
