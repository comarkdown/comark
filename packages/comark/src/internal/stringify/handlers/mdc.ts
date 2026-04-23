import type { State } from 'comark/render'
import type { ComarkElement, ComarkNode } from 'comark'
import { indent } from '../indent.ts'
import { comarkAttributes, comarkYamlAttributes } from '../attributes.ts'
import { html } from './html.ts'

// HTML elements that always create an inline context for their children
const INLINE_HTML_ELEMENTS = new Set(['a', 'strong', 'em', 'span'])

export async function mdc(node: ComarkElement, state: State, parent?: ComarkElement) {
  const [tag, attr, ...children] = node
  const { $, ...attributes } = attr

  if (tag === 'table') {
    return html(node, state)
  }

  const attributeEntries = Object.entries(attributes)
  const hasObjectAttributes = attributeEntries.some(([, value]) => typeof value === 'object')

  // Component is inline if it has text siblings in parent
  // or is inside an inline HTML element
  const hasTextSiblings = parent?.some((child, index) => index > 1 && typeof child === 'string') ?? false
  const insideInlineElement = parent !== undefined && INLINE_HTML_ELEMENTS.has(String(parent[0]))
  let inline = hasTextSiblings || insideInlineElement

  // if component has object attributes, it cannot be inline
  if (hasObjectAttributes) {
    inline = false
  }

  let content = ''
  const childState = { ...state, nodeDepthInTree: (state.nodeDepthInTree || 0) + 1 }
  for (const child of children as ComarkNode[]) {
    content += await state.one(child, childState, node)
  }
  content = content.trimEnd()

  const attrs = attributeEntries.length > 0 ? comarkAttributes(attributes) : ''

  if (tag === 'span') {
    return `[${content}]${attrs}` + (inline ? '' : state.context.blockSeparator)
  }

  const fence = ':'.repeat((state.nodeDepthInTree || 0) + 2)

  let result = `:${tag}${content && `[${content}]`}${attrs}` + (!parent ? state.context.blockSeparator : '')

  if (!inline) {
    const maxInlineAttributes = state.context.maxInlineAttributes ?? 3
    const useYaml = hasObjectAttributes || maxInlineAttributes === 0 || attributeEntries.length > maxInlineAttributes
    if (useYaml) {
      const yamlAttrs = comarkYamlAttributes(attributes, state.context.blockAttributesStyle)
      result = `${fence}${tag}\n${yamlAttrs}${content ? `\n${content}` : ''}\n${fence}` + state.context.blockSeparator
    } else {
      result = `${fence}${tag}${attrs}${content ? `\n${content}` : ''}\n${fence}` + state.context.blockSeparator
    }
  }

  return inline ? result : indent(result, { level: parent ? 1 : 0 })
}
