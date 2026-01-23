import type { MDCElement } from '../types/tree'

// Node types that can be containers (for auto unwrap feature)
const CONTAINER_NODE_TYPES = new Set([
  'alert',
  'card',
  'callout',
  'note',
  'warning',
  'tip',
  'info',
])

// Node types that should not be unwrapped
const NON_UNWRAPPABLE_TYPES = new Set([
  'pre',
  'code',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'ul',
  'ol',
  'li',
  'blockquote',
])

/**
 * Applies automatic unwrapping to container components.
 *
 * This utility removes unnecessary paragraph wrappers from container component children.
 * If a container has only a single paragraph child (and no other block elements),
 * the paragraph is unwrapped and its children are hoisted up to be direct children
 * of the container.
 *
 * @param node - The MDC element to process
 * @returns The node with auto-unwrapped children (if applicable)
 *
 * @example
 * // Before:
 * { tag: 'alert', children: [{ type: 'element', tag: 'p', children: [{ type: 'text', value: 'Text' }] }] }
 *
 * // After:
 * { tag: 'alert', children: [{ type: 'text', value: 'Text' }] }
 */
export function applyAutoUnwrap(node: MDCElement): MDCElement {
  // Only apply to container components
  if (!CONTAINER_NODE_TYPES.has(node.tag)) {
    return node
  }

  // Don't unwrap if there are no children
  if (node.children.length === 0) {
    return node
  }

  // Filter out empty text nodes for checking
  const nonEmptyChildren = node.children.filter(child =>
    child.type !== 'text' || (child.value && child.value.trim()),
  )

  // Check if we have exactly one paragraph child (and possibly empty text nodes)
  const paragraphs = nonEmptyChildren.filter(
    child => child.type === 'element' && child.tag === 'p',
  )

  // Also check for other non-unwrappable elements (lists, code blocks, etc.)
  const hasNonUnwrappableElements = nonEmptyChildren.some(
    child => child.type === 'element'
      && child.tag !== 'p'
      && (NON_UNWRAPPABLE_TYPES.has(child.tag) || child.tag === 'template'),
  )

  // Only unwrap if:
  // 1. There's exactly one paragraph
  // 2. No other non-unwrappable elements (lists, code blocks, etc.)
  if (paragraphs.length === 1 && !hasNonUnwrappableElements) {
    const paragraph = paragraphs[0] as MDCElement
    // Unwrap: return the paragraph's children as the container's direct children
    return {
      ...node,
      children: paragraph.children,
    }
  }

  // Otherwise, keep the structure as-is
  return node
}
