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
      return (await slotContent(node, state)) + state.context.blockSeparator
    }
  }

  const { name: _name, $: _$, ...rest } = attrs

  // `#name` is Comark syntax and does not parse inside an HTML tag; `name` matches the `text/html` output.
  if (state.context.format !== 'markdown/comark') {
    return state.handlers.html(['template', { name: attrs.name, ...rest }, ...(node.slice(2) as Node[])], state, parent)
  }

  const content = await slotContent(node, state)
  const extraAttrs = comarkAttributes(rest)

  return `#${attrs.name}${extraAttrs}\n${content}` + state.context.blockSeparator
}

// `flow()` does not pass `atLineStart`, so slot text starting with `#` or `-` would lose its escape.
async function slotContent(node: ElementNode, state: State): Promise<string> {
  let content = ''
  for (const child of node.slice(2) as Node[]) {
    content += await state.one(child, state, node, content === '' || content.endsWith('\n'))
  }
  return content.trimEnd()
}
