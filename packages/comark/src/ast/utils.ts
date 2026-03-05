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
export function visit(
  tree: ComarkTree,
  checker: (node: ComarkNode) => boolean,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  visitor: (node: ComarkNode) => ComarkNode | false | undefined | void,
) {
  function walk(node: ComarkNode, parent: ComarkNode | ComarkNode[], index: number): boolean {
    let currentNode = node

    if (checker(node)) {
      const res = visitor(node)
      if (res === false) {
        // remove the node from the parent
        (parent as ComarkNode[]).splice(index, 1)
        return true // signal that node was removed
      }

      if (res !== undefined) {
        (parent as ComarkNode[])[index] = res
        currentNode = res
      }
    }

    if (Array.isArray(currentNode) && currentNode.length > 2) {
      // Use a while loop to handle removals correctly - don't increment if node was removed
      let i = 2
      while (i < currentNode.length) {
        const childRemoved = walk(currentNode[i] as ComarkNode, currentNode, i)
        if (childRemoved) {
          // If removed, i stays the same (next node is now at this index)
          continue
        }

        i += 1
      }
    }

    return false
  }

  // Use a while loop to handle removals correctly - don't increment if node was removed
  let i = 0
  while (i < tree.nodes.length) {
    const removed = walk(tree.nodes[i], tree.nodes, i)
    if (removed) {
      // If removed, i stays the same (next node is now at this index)
      continue
    }

    i += 1
  }
}
