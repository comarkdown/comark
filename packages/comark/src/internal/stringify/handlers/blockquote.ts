import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'
import { comarkAttributes, userBlockAttrs } from '../attributes.ts'

export async function blockquote(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  let childResult = ''
  for (const child of children) {
    childResult += await state.one(child, state, node)
  }

  const userAttrs = userBlockAttrs('blockquote', node[1] as Record<string, unknown>)
  const attrs = comarkAttributes(userAttrs)
  const hasBlockChildren = children.some((c) => Array.isArray(c))

  // Multi-block content with attrs has no unambiguous inline form — round-trip
  // via `::blockquote{attrs}` so the attrs aren't visually attached to one
  // paragraph and parsers can recover the same AST.
  if (attrs && hasBlockChildren) {
    const content = childResult
      .trim()
      .split('\n')
      .map((line) => (line ? `> ${line}` : '>'))
      .join('\n')
    return `::blockquote${attrs}\n${content}\n::` + state.context.blockSeparator
  }

  if (attrs) childResult = `${childResult.replace(/[ \t]+$/, '')} ${attrs}`

  const content = childResult
    .trim()
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n')

  if (node[1].as) {
    return `> [!${String(node[1].as).toUpperCase()}]\n` + content + state.context.blockSeparator
  }

  return content + state.context.blockSeparator
}
