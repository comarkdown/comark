import type { State } from 'comark/render'
import type { ElementNode } from 'comark'

// Parents whose children are phrasing content: a comment inside them is inline
const PHRASING_PARENTS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'em',
  'del',
  'a',
  'span',
  'sub',
  'sup',
  'kbd',
  'code',
  'td',
  'th',
])

export function comment(node: ElementNode, state: State, parent?: ElementNode): string {
  if (node[0] === null) {
    // Inline comments (inside a paragraph, emphasis, …) must not end the block.
    // Block comments nested in a container (blockquote, list item, …) still do.
    const isInline =
      parent !== undefined &&
      (PHRASING_PARENTS.has(String(parent[0])) ||
        (parent[1] as { $?: { block?: number } })?.$?.block === 0 ||
        parent.some((child, index) => index > 1 && typeof child === 'string'))
    return `<!--${node[2]}-->` + (isInline ? '' : state.context.blockSeparator)
  }

  return ''
}
