import type { State } from 'comark/render'
import type { ElementNode, Node } from 'comark'
import { indent } from '../../../utils/index.ts'
import { comarkAttributes, comarkYamlAttributes } from '../attributes.ts'

// HTML elements that always create an inline context for their children
const INLINE_HTML_ELEMENTS = new Set(['a', 'strong', 'em', 'span'])

/** A named slot (`#name`). A `template` without `name` is a `:template` component. */
function isSlot(node: Node): boolean {
  return Array.isArray(node) && node[0] === 'template' && typeof node[1]?.name === 'string'
}

export async function mdc(node: ElementNode, state: State, parent?: ElementNode): Promise<string> {
  const [tag, attr, ...children] = node
  const { $: _, ...attributes } = attr

  const attributeEntries = Object.entries(attributes)
  const hasObjectAttributes = attributeEntries.some(([, value]) => typeof value === 'object')

  // Component is inline if it has text siblings in parent,
  // is inside an inline HTML element or an inline-rendering ancestor
  const hasTextSiblings = parent?.some((child, index) => index > 1 && typeof child === 'string') ?? false
  const insideInlineElement = parent !== undefined && INLINE_HTML_ELEMENTS.has(String(parent[0]))
  let inline = hasTextSiblings || insideInlineElement || state.context.inline === true

  if (hasObjectAttributes) {
    inline = false
  }

  // Block fences inside `:name[...]` content cannot be parsed back; keep children inline
  const revert = inline ? state.applyContext({ inline: true }) : undefined

  let content = ''
  const childState = { ...state, nodeDepthInTree: (state.nodeDepthInTree || 0) + 1 }
  for (const child of children as Node[]) {
    // Auto-unwrapped default content is inline, so the `#slot` marker needs its own line.
    if (content && !content.endsWith('\n') && isSlot(child)) {
      content += state.context.blockSeparator
    }
    // Block bodies start on their own line, so `#` / `-` text there keeps its escape.
    content += await state.one(child, childState, node, !inline && (content === '' || content.endsWith('\n')))
  }
  content = content.trimEnd()

  if (revert) {
    state.applyContext(revert)
  }

  let attrs = attributeEntries.length > 0 ? comarkAttributes(attributes) : ''

  if (tag === 'span') {
    if (!attrs && parent?.[0] == 'a') {
      // Empty `{}` inside links disambiguates `[span]{}` from link syntax.
      attrs ||= '{}'
    }
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

  // Indented after a list, the component would continue the last list item
  const prev = parent?.[parent.indexOf(node) - 1]
  const afterList = Array.isArray(prev) && (prev[0] === 'ul' || prev[0] === 'ol')

  return inline ? result : indent(result, { level: parent && !afterList ? 1 : 0 })
}
