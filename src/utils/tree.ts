import type { MDCElement, MDCNode } from '../types/tree'

export function flattenNodeText(node: MDCNode): string {
  if (node.type === 'comment') {
    return ''
  }

  if (node.type === 'text') {
    return node.value || ''
  }
  else {
    return (node.children || []).reduce((text: string, child: MDCNode) => {
      return text.concat(flattenNodeText(child))
    }, '')
  }
}

export function flattenNode(node: MDCNode, maxDepth = 2, _depth = 0): Array<MDCNode> {
  if (!Array.isArray((node as MDCElement).children) || _depth === maxDepth) {
    return [node]
  }
  return [
    node,
    ...(node as MDCElement).children.reduce((acc, child) => acc.concat(flattenNode(child, maxDepth, _depth + 1)), [] as Array<MDCNode>),
  ]
}

export function setNodeData(node: MDCNode & { data: any }, name: string, value: any, pageData: any) {
  if (!name.startsWith(':')) {
    name = `:${name}`
  }
  const dataKey = `content_d_${randomHash()}`
  pageData[dataKey] = value
  node.data.hProperties[name] = dataKey
}

function randomHash() {
  return Math.random().toString(36).substr(2, 16)
}

export function extractText(node: MDCNode): string {
  if (node.type === 'text') {
    return node.value || ''
  }
  if (node.type === 'comment') {
    return ''
  }
  return (node.children || []).reduce((text: string, child: MDCNode) => {
    return text.concat(extractText(child))
  }, '')
}
