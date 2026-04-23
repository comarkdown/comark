import type { ComarkElement, ComarkElementAttributes, ComarkTree } from '../../types'

/**
 * Extracts reusable nodes from the last output tree
 * @param markdown - The markdown to parse
 * @param lastOutput - The last output tree
 * @returns The reusable nodes and the remaining markdown
 */
export function extractReusableNodes(markdown: string, lastOutput: ComarkTree) {
  let lastValidNodeIndex = -1
  let i = lastOutput.nodes.length - 1
  let lastNodeIgnored = false
  while (i >= 0) {
    const node = lastOutput.nodes[i] as ComarkElement
    if (node[1] && node[1].$?.line) {
      if (lastNodeIgnored) {
        lastValidNodeIndex = i
        break
      } else {
        lastNodeIgnored = true
      }
    }
    i--
  }
  const lastNode = lastValidNodeIndex !== -1 ? lastOutput.nodes[lastValidNodeIndex] : null
  if (lastNode) {
    const remainingMarkdownStartLine = (lastNode[1] as ComarkElementAttributes).$?.line ?? 0
    return {
      remainingMarkdownStartLine,
      reusedNodes: lastOutput.nodes.slice(0, lastValidNodeIndex + 1),
      remainingMarkdown: markdown.split('\n').slice(remainingMarkdownStartLine).join('\n') || '',
    }
  }

  return {
    remainingMarkdownStartLine: 0,
    remainingMarkdown: markdown,
    reusedNodes: [],
  }
}
