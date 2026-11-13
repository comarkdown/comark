import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { comarkAttributes, userBlockAttrs } from '../attributes.ts'
import { textContent } from '../../../utils/index.ts'

export function code(node: ElementNode, _state: State) {
  const [_, attributes] = node
  // Highlighters (shiki / rangi) take over the `class` of highlighted inline
  // code, so strip their portion back off instead of echoing `.shiki` / `.shj`
  // into the markdown.
  const attrs = userBlockAttrs('code', attributes as Record<string, unknown>)
  const attrsString = Object.keys(attrs).length > 0 ? comarkAttributes(attrs) : ''
  const content = textContent(node)
  const fence = pickInlineFence(content)
  // A backtick at either edge would join the fence, and the parser strips one
  // space from each side of content that starts and ends with one, so pad
  // both sides with a space the parser takes back off.
  const edgeBacktick = content.startsWith('`') || content.endsWith('`')
  const edgeSpaces = content.startsWith(' ') && content.endsWith(' ') && /[^ ]/.test(content)
  const pad = edgeBacktick || edgeSpaces ? ' ' : ''

  return `${fence}${pad}${content}${pad}${fence}${attrsString}`
}

/**
 * A code span closes on the first backtick run as long as the one it opened
 * with. Going one longer than the longest run inside, rather than picking the
 * shortest unused length, also keeps auto-close from treating a longer inner
 * run as an unclosed span.
 */
function pickInlineFence(content: string): string {
  const longest = (content.match(/`+/g) ?? []).reduce((max, run) => Math.max(max, run.length), 0)
  return '`'.repeat(longest + 1)
}
