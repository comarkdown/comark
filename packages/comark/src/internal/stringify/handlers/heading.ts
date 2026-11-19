import type { State } from 'comark/render'
import type { ElementNode, HeadingIdsOption } from 'comark'
import { textContent } from '../../../utils/index.ts'
import { createHeadingIdTracker, nextHeadingId, reserveHeadingId, type HeadingIdTracker } from '../../heading-id.ts'
import { comarkAttributes } from '../attributes.ts'
import { escapeLeadingBlock } from '../state.ts'

// Replays the parser's id generation across one render so each heading's
// implicit id is known (`null` when ids are disabled).
// Keyed by `state.context`: component children render with a copied `state` but share its `context`.
const trackers = new WeakMap<State['context'], HeadingIdTracker | null>()

function autoHeadingId(node: ElementNode, level: number, state: State, id: unknown): string | undefined {
  let tracker = trackers.get(state.context)
  if (tracker === undefined) {
    tracker = createHeadingIdTracker(state.context.headingIds as HeadingIdsOption | undefined) ?? null
    trackers.set(state.context, tracker)
  }
  if (!tracker) return undefined
  const text = node
    .slice(2)
    // Markdown output leaves out the separate link `heading-links` adds
    .filter((child) => !(Array.isArray(child) && child[1]?.$?.permalink === 'separate'))
    .map((child) => textContent(child as ElementNode))
    .join('')
  const autoId = nextHeadingId(text, level, tracker)
  // Mirror the parser: an explicit id is reserved so later headings skip it.
  reserveHeadingId(tracker, id)
  return autoId
}

// h1, h2, h3, h4, h5, h6
export async function heading(node: ElementNode, state: State) {
  const [tag] = node

  const level = Number(tag.slice(1))

  let content = await state.flow(node, state)

  // The auto-generated id is implicit in `# Heading` markdown; only echo a custom one.
  const { id, ...rest } = node[1] as Record<string, unknown>
  const autoId = autoHeadingId(node, level, state, id)
  const attrs = comarkAttributes(id === undefined || id === autoId ? rest : { id, ...rest })
  const suffix = attrs ? ` ${attrs}` : ''

  // An ATX heading ends at the line break, so a multi-line h1/h2 (setext
  // source) keeps its underline form. Its text then starts the line, where a
  // leading `#`, `>`, `-`... needs the escape the `# ` prefix made unnecessary.
  if (level <= 2 && content.includes('\n')) {
    if (typeof node[2] === 'string' && node[2]) {
      const end = content.indexOf('\n')
      content = escapeLeadingBlock(content.slice(0, end)) + content.slice(end)
    }
    return content + suffix + '\n' + (level === 1 ? '===' : '---') + state.context.blockSeparator
  }

  return '#'.repeat(level) + ' ' + content + suffix + state.context.blockSeparator
}
