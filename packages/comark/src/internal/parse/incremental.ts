import type { ComarkElement, ComarkElementAttributes, ComarkTree } from '../../ast'

/**
 * Extracts reusable nodes from the last output tree
 * @param markdown - The markdown to parse
 * @param lastOutput - The last output tree
 * @returns The reusable nodes and the remaining markdown
 */
export function extractResuableNodes(markdown: string, lastOutput: ComarkTree) {
  let lastValidNodeIndex = -1
  let i = lastOutput.nodes.length - 1
  let lastNodeIgnored = false
  while (i >= 0) {
    const node = lastOutput.nodes[i] as ComarkElement
    if (node[1] && node[1].$comark?.line) {
      if (lastNodeIgnored) {
        lastValidNodeIndex = i
        break
      }
      else {
        lastNodeIgnored = true
      }
    }
    i--
  }
  const lastNode = lastValidNodeIndex !== -1 ? lastOutput.nodes[lastValidNodeIndex] : null
  if (lastNode) {
    const remainingMarkdownStartLine = (lastNode[1] as ComarkElementAttributes).$comark?.line ?? 0
    return {
      remainingMarkdownStartLine,
      reusedNodes: lastOutput.nodes.slice(0, lastValidNodeIndex + 1),
      remainingMarkdown: '\n' // Add back the new line character which will be remove by the slice and join
        + markdown.split('\n').slice(remainingMarkdownStartLine + 1).join('\n') || '',
    }
  }

  return {
    remainingMarkdownStartLine: 0,
    remainingMarkdown: markdown,
    reusedNodes: [],
  }
}
