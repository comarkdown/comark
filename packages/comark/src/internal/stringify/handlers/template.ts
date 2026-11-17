import type { State } from 'comark/render'
import type { ElementNode, Node } from 'comark'
import { comarkAttributes } from '../attributes.ts'
import { component } from './component.ts'

// slot template
export async function template(node: ElementNode, state: State, parent?: ElementNode) {
  const [_, attrs] = node

  // Parsed slots always carry a `name`; without one this is a `:template` component.
  if (typeof attrs.name !== 'string') {
    return component(node, state, parent)
  }

  // Omit #default marker if this is the only slot
  if (attrs.name === 'default') {
    const siblings = parent ? (parent.slice(2) as Node[]) : []
    const templateCount = siblings.filter(
      (child) => Array.isArray(child) && (child as ElementNode)[0] === 'template'
    ).length
    if (templateCount === 1) {
      return (await state.flow(node, state)).trimEnd() + state.context.blockSeparator
    }
  }

  const { name: _name, $: _$, ...rest } = attrs

  // `#name` is Comark syntax and does not parse inside an HTML tag.
  if (state.context.format !== 'markdown/comark') {
    return state.handlers.html(
      ['template', { [`v-slot:${attrs.name}`]: '', ...rest }, ...(node.slice(2) as Node[])],
      state,
      parent
    )
  }

  const content = (await state.flow(node, state)).trimEnd()
  const extraAttrs = comarkAttributes(rest)

  return `#${attrs.name}${extraAttrs}\n${content}` + state.context.blockSeparator
}
