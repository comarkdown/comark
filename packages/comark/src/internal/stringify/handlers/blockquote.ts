import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'

export async function blockquote(node: ComarkElement, state: State) {
  const children = node.slice(2) as ComarkNode[]

  let childResult = ''
  for (const child of children) {
    childResult += await state.one(child, state, node)
  }
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
