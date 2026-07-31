import type { State } from 'comark/render'
import type { ElementNode, Node } from 'comark'
import { comarkAttributes } from '../attributes.ts'

// slot template
export async function template(node: ElementNode, state: State, parent?: ElementNode) {
  const [_, attrs] = node

  const content = (await state.flow(node, state)).trimEnd()

  // Omit #default marker if this is the only slot
  if (attrs.name === 'default') {
    const siblings = parent ? (parent.slice(2) as Node[]) : []
    const templateCount = siblings.filter(
      (child) => Array.isArray(child) && (child as ElementNode)[0] === 'template'
    ).length
    if (templateCount === 1) {
      return content + state.context.blockSeparator
    }
  }

  const { name: _name, $: _$, ...rest } = attrs
  const extraAttrs = comarkAttributes(rest)

  return `#${attrs.name}${extraAttrs}\n${content}` + state.context.blockSeparator
}
