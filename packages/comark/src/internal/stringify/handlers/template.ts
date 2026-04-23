import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'

// slot template
export async function template(node: ComarkElement, state: State, parent?: ComarkElement) {
  const [_, attrs] = node

  const content = (await state.flow(node, state)).trimEnd()

  // Omit #default marker if this is the only slot
  if (attrs.name === 'default') {
    const siblings = parent ? (parent.slice(2) as ComarkNode[]) : []
    const templateCount = siblings.filter(
      (child) => Array.isArray(child) && (child as ComarkElement)[0] === 'template'
    ).length
    if (templateCount === 1) {
      return content + state.context.blockSeparator
    }
  }

  return `#${attrs.name}\n${content}` + state.context.blockSeparator
}
