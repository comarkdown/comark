import type { VNode } from 'vue'
import type { MDCElement, MDCNode, MDCText } from '@nuxtjs/mdc'

/**
 * List of text nodes
 */
export const TEXT_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']

/**
 * Check virtual node's tag
 * @param vnode Virtual node from Vue virtual DOM
 * @param tag tag name
 * @returns `true` it the virtual node match the tag
 */
export function isTag(vnode: VNode | MDCNode, tag: string | symbol): boolean {
  // Vue 3 uses `type` instead of `tag`
  if (vnode.type === tag) {
    return true
  }
  // Vue 3 VNode `type` can be an object (tag is provided by ContentRendererMarkdown)
  if (typeof vnode.type === 'object' && (vnode.type as any).tag === tag) {
    return true
  }
  // Markdown node
  if ((vnode as MDCElement).tag === tag) {
    return true
  }
  return false
}

/**
 * Check if virtual node is text node
 */
export function isText(vnode: VNode | MDCNode): boolean {
  return isTag(vnode, 'text') || isTag(vnode, Symbol.for('v-txt'))
}

/**
 * Find children of a virtual node
 * @param node Virtuel node from Vue virtual DOM
 * @returns Children of given node
 */
export function nodeChildren(node: VNode | MDCElement) {
  if (Array.isArray(node.children) || typeof node.children === 'string') {
    return node.children
  }
  // Vue3 VNode children
  if (typeof node.children?.default === 'function') {
    return node.children.default()
  }
  return []
}

/**
 * Calculate text content of a virtual node
 * @param node Virtuel node from Vue virtual DOM
 * @returns text content of given node
 */
export function nodeTextContent(node: VNode | MDCNode): string {
  // Return empty string is vnode is falsy
  if (!node) {
    return ''
  }

  if (Array.isArray(node)) {
    return node.map(nodeTextContent).join('')
  }

  if (isText(node)) {
    return (node as MDCText).value! || (node as VNode).children as string || ''
  }

  // Walk through node children
  const children = nodeChildren(node as MDCElement)
  if (Array.isArray(children)) {
    return children.map(nodeTextContent).filter(Boolean).join('')
  }

  // Return empty string for non-text nodes without any children
  return ''
}

/**
 * Unwrap tags within a virtual node
 * @param vnode Virtuel node from Vue virtual DOM
 * @param tags list of tags to unwrap
 *
 */
export function unwrap(vnode: VNode, tags: string[] = []): VNode | VNode[] {
  if (Array.isArray(vnode)) {
    return vnode.flatMap(node => unwrap(node, tags))
  }

  let result: VNode | VNode[] = vnode

  // unwrap children
  if (tags.some(tag => tag === '*' || isTag(vnode, tag))) {
    result = nodeChildren(vnode) || vnode
    if (!Array.isArray(result) && TEXT_TAGS.some(tag => isTag(vnode, tag))) {
      result = [result]
    }
  }

  return result
}

function _flatUnwrap(vnodes: VNode | VNode[], tags: string[] = []): Array<VNode> {
  vnodes = Array.isArray(vnodes) ? vnodes : [vnodes]

  if (!tags.length) {
    return vnodes
  }

  return vnodes
    .flatMap(vnode => _flatUnwrap(unwrap(vnode, [tags[0]!]), tags.slice(1)))
    .filter(vnode => !(isText(vnode) && nodeTextContent(vnode).trim() === ''))
}

export function flatUnwrap(vnodes: VNode | VNode[], tags: string | string[] = []): Array<VNode | string> | VNode {
  if (typeof tags === 'string') {
    tags = tags.split(/[,\s]/).map(tag => tag.trim()).filter(Boolean)
  }

  if (!tags.length) {
    return vnodes
  }

  return _flatUnwrap(vnodes, tags as unknown as string[])
    .reduce((acc, item) => {
      if (isText(item)) {
        if (typeof acc[acc.length - 1] === 'string') {
          acc[acc.length - 1] += item.children as string
        }
        else {
          acc.push(item.children as string)
        }
      }
      else {
        acc.push(item)
      }
      return acc
    }, [] as Array<VNode | string>)
}