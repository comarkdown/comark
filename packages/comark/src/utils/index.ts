// #region Tree Utils

import { decodeHTML } from 'entities'
import type { ComarkNode, ComarkTree } from 'comark'

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

// #region String Utils

/**
 * Convert a string to pascal case
 * @param str - The string to convert
 * @returns The pascal case string
 */
export function pascalCase(str: string) {
  return str ? splitByCase(str).map(p => p[0].toUpperCase() + p.slice(1)).join('') : ''
}

/**
 * Convert a string to kebab case
 * @param str - The string to convert
 * @returns The kebab case string
 */
export function kebabCase(str: string) {
  return str ? splitByCase(str).map(p => p.toLowerCase()).join('-') : ''
}

/**
 * Convert a string to camel case
 * @param str - The string to convert
 * @returns The camel case string
 */
export function camelCase(str: string) {
  if (!str) {
    return ''
  }
  str = pascalCase(str)
  return str.charAt(0).toLowerCase() + str.slice(1)
}

// split a string by case
function splitByCase(str: string) {
  const parts: string[] = []
  if (!str) {
    return parts
  }
  let buff = ''
  let previousUpper: boolean | undefined
  let previousSplitter: boolean | undefined
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    // Fast splitter check using direct character comparisons
    const isSplitter = char === '-' || char === '_' || char === '/' || char === '.'
    if (isSplitter === true) {
      parts.push(buff)
      buff = ''
      previousUpper = void 0
      continue
    }
    // Fast number check using character codes
    const charCode = char.charCodeAt(0)
    const isNumber = charCode >= 48 && charCode <= 57 // '0' to '9'
    // Fast uppercase check using character codes
    const isUpper = isNumber ? void 0 : (charCode >= 65 && charCode <= 90) // 'A' to 'Z'
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff)
        buff = char
        previousUpper = isUpper
        continue
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff[buff.length - 1]
        parts.push(buff.slice(0, buff.length - 1))
        buff = lastChar + char
        previousUpper = isUpper
        continue
      }
    }
    buff += char
    previousUpper = isUpper
    previousSplitter = isSplitter
  }
  parts.push(buff)
  return parts
}

// #endregion
