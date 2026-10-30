import type { State } from 'comark/render'
import type { ElementNode, Node } from 'comark'
import { indent } from '../../../utils/index.ts'
import { comarkAttributes, userBlockAttrs } from '../attributes.ts'

// Block elements that need explicit indentation in list items.
// Note: ol/ul are handled by their own handlers which manage indentation via listIndent context.
const blockElements = new Set(['pre', 'blockquote', 'table'])

export async function li(node: ElementNode, state: State) {
  const children = node.slice(2) as Node[]

  const order = state.context.order
  let prefix = order ? `${order}. ` : '- '

  const className =
    (node[1].className as string) && Array.isArray(node[1].className)
      ? node[1].className.join(' ')
      : String(node[1].className || node[1].class)

  // Continuation lines align with the item's content, which starts after the
  // list marker: the `[ ] ` checkbox is part of that content, not the marker.
  const prefixWidth = prefix.length

  if (className.includes('task-list-item')) {
    const input = takeCheckbox(children)
    if (input) {
      prefix += input[1].checked || input[1][':checked'] ? '[x] ' : '[ ] '
    }
  }

  // Direct text children render sibling components inline.
  const hasInlineContent = children.some((child) => typeof child === 'string')

  let result = ''

  for (const child of children) {
    if (Array.isArray(child)) {
      const tag = child[0] as string

      if (result && blockElements.has(tag)) {
        const indented = indent(await state.one(child, state, node), { width: prefixWidth })
        result = result.trimEnd() + '\n' + indented.trimEnd() + '\n'
        continue
      }

      if (result && tag === 'p') {
        const indented = indent(await state.one(child, state, node), { width: prefixWidth })
        result = result.trimEnd() + '\n\n' + indented.trimEnd() + '\n'
        continue
      }

      // No parent → mdc skips its own nesting indentation, so li owns it here.
      if (!hasInlineContent && !(tag in state.handlers)) {
        const indented = indent(await state.one(child, state), { width: prefixWidth, ignoreFirstLine: !result })
        result = result ? result.trimEnd() + '\n' + indented.trimEnd() + '\n' : indented.trimEnd() + '\n'
        continue
      }
    }
    result += await state.one(child, state, node, result === '' || result.endsWith('\n'))
  }
  result = result.trim()

  const attrs = comarkAttributes(userBlockAttrs('li', node[1] as Record<string, unknown>))
  const suffix = attrs ? ` ${attrs}` : ''

  if (order) {
    state.applyContext({ order: order + 1 })
  }

  return `${prefix}${result}${suffix}\n`
}

function isCheckbox(node: Node | undefined): node is ElementNode {
  return Array.isArray(node) && node[0] === 'input'
}

/**
 * Remove the task checkbox from `children` and return it. In a tight list the
 * checkbox is the item's first child; in a loose list it opens the item's
 * first paragraph, which is replaced by a copy without it so the node passed
 * in is left untouched.
 */
function takeCheckbox(children: Node[]): ElementNode | undefined {
  const first = children[0]
  if (isCheckbox(first)) {
    children.shift()
    return first
  }
  if (Array.isArray(first) && first[0] === 'p') {
    const [tag, attrs, checkbox, ...rest] = first as ElementNode
    if (isCheckbox(checkbox)) {
      children[0] = [tag, attrs, ...rest]
      return checkbox
    }
  }
  return undefined
}
