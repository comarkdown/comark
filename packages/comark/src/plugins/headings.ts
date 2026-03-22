import type { ComarkPlugin, ComarkNode } from 'comark'

export interface HeadingsOptions {
  /**
   * Tag to extract as title and set to `tree.meta.title`.
   * @default 'h1'
   */
  titleTag?: string
  /**
   * Tag to extract as description and set to `tree.meta.description`.
   * Useful alternatives: `'blockquote'`
   * @default 'p'
   */
  descriptionTag?: string
  /**
   * Whether to remove the extracted nodes from the tree.
   * @default true
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
 * Both nodes are removed from the tree by default so they are not rendered
 * twice. Set `remove: false` to keep them in place.
 *
 * @example
 * ```ts
 * // Default — h1 as title, first paragraph as description
 * headings()
 *
 * // Use a blockquote as the description instead of a paragraph
 * headings({ descriptionTag: 'blockquote' })
 *
 * // Extract metadata without removing the nodes from the tree
 * headings({ remove: false })
 * ```
 */
export default function headings(options: HeadingsOptions = {}): ComarkPlugin {
  const { titleTag = 'h1', descriptionTag = 'p', remove = true } = options

  return {
    name: 'headings',
    post(state) {
      const nodes = state.tree.nodes

      // Top-level content nodes — skip raw text nodes and <hr>
      const contentNodes = nodes.filter(node => Array.isArray(node) && getTag(node) !== 'hr')

      let titleNodeIndex = -1
      let descriptionNodeIndex = -1

      const first = contentNodes[0]
      if (first && getTag(first) === titleTag) {
        titleNodeIndex = nodes.indexOf(first)
        state.tree.meta.title = flattenNodeText(first)
      }

      // Description is the first content node after the (optional) title
      const afterTitle = titleNodeIndex !== -1 ? contentNodes.slice(1) : contentNodes
      const second = afterTitle[0]
      if (second && getTag(second) === descriptionTag) {
        descriptionNodeIndex = nodes.indexOf(second)
        state.tree.meta.description = flattenNodeText(second)
      }

      if (remove) {
        // Remove in reverse order to preserve indices
        const toRemove = [titleNodeIndex, descriptionNodeIndex]
          .filter(i => i !== -1)
          .sort((a, b) => b - a)
        for (const i of toRemove) {
          nodes.splice(i, 1)
        }
      }
    },
  }
}
