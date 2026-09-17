import type { ElementNode, NodeHandler } from '../../types.ts'

const control: NodeHandler = async (node, state) => {
  const [tag, attrs, ...branches] = node
  const block = attrs.block === true
  const separator = block ? '\n' : ''
  let output = ''
  for (const [index, child] of (branches as ElementNode[]).entries()) {
    let directive: string
    if (index === 0)
      directive =
        tag === 'comark-if' ? `if ${attrs.test}` : `for ${(attrs.names as string[]).join(', ')} in ${attrs.expression}`
    else directive = child[1].test === undefined ? 'else' : `elif ${child[1].test}`
    const content = await state.flow(child, state)
    output += `{% ${directive} %}${separator}${block ? content.trimEnd() + '\n' : content}`
  }
  return output + `{% ${tag === 'comark-if' ? 'endif' : 'endfor'} %}` + (block ? state.context.blockSeparator : '')
}

export const templateHandlers: Record<string, NodeHandler> = {
  'comark-if': control,
  'comark-for': control,
  'comark-expression': (node) => `{{ ${node[1].source} }}`,
}
