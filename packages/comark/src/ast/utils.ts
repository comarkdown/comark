import type { ComarkNode, ComarkTree } from './types'
import { decodeHTML } from 'entities'

/**
 * Get the text content of a Comark node
 *
 * @param node - The Comark node
 * @param options - The options
 * @returns The text content
 */
export function textContent(node: ComarkNode, options: { decodeUnicodeEntities?: boolean } = {}): string {
  if (typeof node === 'string') {
    if (options.decodeUnicodeEntities) {
      return decodeHTML(node)
    }
    return node as string
  }
  let out = ''
  const len = node.length
  for (let i = 2; i < len; i++) {
    out += textContent(node[i] as ComarkNode, options)
  }
  return out
}

/**
 * Visit a Comark tree and apply a visitor function to each node
 *
 * @param tree - The Comark tree
 * @param checker - A function that checks if a node should be visited
 * @param visitor - A function that visits a node
 */
export function visit(tree: ComarkTree, checker: (node: ComarkNode) => boolean, visitor: (node: ComarkNode) => ComarkNode | undefined) {
  function walk(node: ComarkNode, parent: ComarkNode | ComarkNode[], index: number) {
    if (checker(node)) {
      const res = visitor(node)
      if (res !== undefined) {
        (parent as ComarkNode[])[index] = res
      }
    }
    if (Array.isArray(node) && node.length > 2) {
      for (let i = 2; i < node.length; i++) {
        walk(node[i] as ComarkNode, node, i)
      }
    }
  }

  tree.value.forEach((node, i) => {
    walk(node, tree.value, i)
  })
}
