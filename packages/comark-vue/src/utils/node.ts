import type { VNode } from 'vue'

export const TEXT_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']

export function isTag(vnode: VNode, tag: string | symbol): boolean {
  if (vnode.type === tag) {
    return true
  }
  if (typeof vnode.type === 'object' && (vnode.type as any).tag === tag) {
    return true
  }
  return false
}

export function isText(vnode: VNode): boolean {
  return isTag(vnode, 'text') || isTag(vnode, Symbol.for('v-txt'))
}

export function nodeChildren(node: VNode) {
  if (Array.isArray(node.children) || typeof node.children === 'string') {
    return node.children
  }
  if (typeof node.children?.default === 'function') {
    return node.children.default()
  }
  return []
}

export function nodeTextContent(node: VNode): string {
  if (!node) {
    return ''
  }
  if (Array.isArray(node)) {
    return (node as VNode[]).map(nodeTextContent).join('')
  }
  if (isText(node)) {
    return node.children as string || ''
  }
  const children = nodeChildren(node)
  if (Array.isArray(children)) {
    return children.map(nodeTextContent).filter(Boolean).join('')
  }
  return ''
}

export function unwrap(vnode: VNode, tags: string[] = []): VNode | VNode[] {
  if (Array.isArray(vnode)) {
    return (vnode as VNode[]).flatMap(node => unwrap(node, tags))
  }
  let result: VNode | VNode[] = vnode
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
