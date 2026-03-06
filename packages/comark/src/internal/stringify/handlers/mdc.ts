import type { State } from '../types'
import type { ComarkElement, ComarkNode } from '../../../ast/types'
import { indent } from '../indent'
import { comarkAttributes, comarkYamlAttributes } from '../attributes'
import { html } from './html'

// HTML elements that always create an inline context for their children
const INLINE_HTML_ELEMENTS = new Set(['a', 'strong', 'em', 'span'])

export function mdc(node: ComarkElement, state: State, parent?: ComarkElement) {
  const [tag, attributes, ...children] = node

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

  const content = children.map((child: ComarkNode) => state.one(child, { ...state, nodeDepthInTree: (state.nodeDepthInTree || 0) + 1 }, node))
    .join('').trimEnd()

  const attrs = attributeEntries.length > 0 ? comarkAttributes(attributes) : ''

  if (tag === 'span') {
    return `[${content}]${attrs}`
  }

  const fence = ':'.repeat((state.nodeDepthInTree || 0) + 2)

  let result = `:${tag}${content && `[${content}]`}${attrs}` + (!parent ? state.context.blockSeparator : '')

  if (!inline) {
    if (attrs.length > 64 || hasObjectAttributes) {
      const yamlAttrs = comarkYamlAttributes(attributes)
      result = `${fence}${tag}\n${yamlAttrs}${content ? `\n${content}` : ''}\n${fence}` + state.context.blockSeparator
    }
    else {
      result = `${fence}${tag}${attrs}${content ? `\n${content}` : ''}\n${fence}` + state.context.blockSeparator
    }
  }

  return inline ? result : indent(result, { level: parent ? 1 : 0 })
}
