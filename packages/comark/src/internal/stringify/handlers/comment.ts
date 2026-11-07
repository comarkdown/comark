import type { State } from 'comark/render'
import type { ElementNode } from 'comark'

// Parents whose children are phrasing content: a comment inside them is inline.
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

export function comment(node: ElementNode, state: State, parent?: ElementNode) {
  if (node[0] === null) {
    // Inline comments (phrasing parents, inline HTML, or an inline render
    // context) must not end the block. Block comments in a container still do.
    const inline =
      state.context.inline === true ||
      (parent !== undefined &&
        (PHRASING_PARENTS.has(String(parent[0])) ||
          parent[1]?.$?.block === 0 ||
          parent.some((child, index) => index > 1 && typeof child === 'string')))
    return `<!--${node[2]}-->` + (inline ? '' : state.context.blockSeparator)
  }

  // Comments have a `null` tag; an element named `comment` is a component.
  // (Not via `./component.ts`: `comark/render/html` imports this file and must
  // stay free of the other handlers. It never reaches here with an element.)
  return state.context.format === 'markdown/comark'
    ? state.handlers.mdc(node, state, parent)
    : state.handlers.html(node, state, parent)
}
