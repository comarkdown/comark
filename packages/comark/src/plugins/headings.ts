import type { ComarkNode } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'

export interface HeadingsOptions {
  /**
   * Tag to extract as title and set to `tree.meta.title`.
   * Set to `false` to disable title extraction.
   * @default 'h1'
   */
  titleTag?: string | false
  /**
   * Tag to extract as description and set to `tree.meta.description`.
   * Useful alternatives: `'blockquote'`
   * Set to `false` to disable description extraction.
   * @default 'p'
   */
  descriptionTag?: string | false
  /**
   * Whether to remove the extracted nodes from the tree.
   * @default false
   */
  remove?: boolean
}

function getTag(node: ComarkNode): string | null {
  if (Array.isArray(node) && node.length >= 1) {
    return node[0] as string
  }
  return null
}

function getChildren(node: ComarkNode): ComarkNode[] {
  if (Array.isArray(node) && node.length > 2) {
    return node.slice(2) as ComarkNode[]
  }
  return []
}

function flattenNodeText(node: ComarkNode): string {
  if (typeof node === 'string') {
    return node
  }
  if (Array.isArray(node)) {
    return getChildren(node).reduce((text: string, child: ComarkNode) => {
      return text + flattenNodeText(child)
    }, '')
  }
  return ''
}

/**
 * Extracts the title and description from the top of the document and sets
 * them on `tree.meta.title` and `tree.meta.description`.
 *
 * The plugin scans the top-level nodes (ignoring `<hr>` and bare text nodes)
 * and checks the first two content nodes in order:
 *
 * 1. If the first node matches `titleTag` (default `h1`), its text content is
 *    written to `tree.meta.title`.
 * 2. If the next content node matches `descriptionTag` (default `p`), its text
 *    content is written to `tree.meta.description`. When no title was found,
 *    this check starts from the very first content node.
 *
 * By default the extracted nodes are kept in the tree. Set `remove: true`
 * to strip them so they are not rendered twice.
 *
 * @example
 * ```ts
 * // Default — h1 as title, first paragraph as description, nodes kept in tree
 * headings()
 *
 * // Use a blockquote as the description instead of a paragraph
 * headings({ descriptionTag: 'blockquote' })
 *
 * // Extract metadata and remove the matched nodes from the tree
 * headings({ remove: true })
 *
 * // Disable title extraction, only extract description
 * headings({ titleTag: false })
 *
 * // Disable description extraction, only extract title
 * headings({ descriptionTag: false })
 * ```
 */
export default defineComarkPlugin<HeadingsOptions, { title?: string; description?: string }>((options = {}) => {
  const { titleTag = 'h1', descriptionTag = 'p', remove = false } = options

  return {
    name: 'headings',
    post(state) {
      const nodes = state.tree.nodes

      // Top-level content nodes — skip raw text nodes and <hr>
      const contentNodes = nodes.filter((node) => Array.isArray(node) && getTag(node) !== 'hr')

      let titleNodeIndex = -1
      let descriptionNodeIndex = -1

      let nextContentIndex = 0

      if (titleTag !== false) {
        const first = contentNodes[0]
        if (first && getTag(first) === titleTag) {
          titleNodeIndex = nodes.indexOf(first)
          state.tree.meta.title = flattenNodeText(first)
          nextContentIndex = 1
        }
      }

      if (descriptionTag !== false) {
        const candidate = contentNodes[nextContentIndex]
        if (candidate && getTag(candidate) === descriptionTag) {
          descriptionNodeIndex = nodes.indexOf(candidate)
          state.tree.meta.description = flattenNodeText(candidate)
        }
      }

      if (remove) {
        // Remove in reverse order to preserve indices
        const toRemove = [titleNodeIndex, descriptionNodeIndex].filter((i) => i !== -1).sort((a, b) => b - a)
        for (const i of toRemove) {
          nodes.splice(i, 1)
        }
      }
    },
  }
})
