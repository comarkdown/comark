export * from 'comark/utils'

import type { ElementNode, Node } from 'comark'
import type React from 'react'

/**
 * Tags this renderer paints as their own box-level renderable. Anything else is
 * inline and has to live inside a `text` — OpenTUI's reconciler throws
 * `Text must be created inside of a text node` otherwise, so the distinction is
 * load-bearing rather than cosmetic.
 */
export const BLOCK_TAGS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'pre',
  'blockquote',
  'table',
  'hr',
])

export function isElementNode(node: Node): node is ElementNode {
  return Array.isArray(node) && typeof node[0] === 'string'
}

export function isBlockNode(node: Node): boolean {
  return isElementNode(node) && BLOCK_TAGS.has(node[0])
}

/**
 * Children that never reach a custom component's `children`:
 *
 *   - comment nodes carry a `null` tag and Comark's walker drops them;
 *   - `template` children are pulled out as named slots before children are
 *     assembled.
 *
 * They have to be skipped when lining rendered children back up against the
 * source node — see {@link groupChildrenByFlow}.
 */
export function rendersNothing(node: Node): boolean {
  if (typeof node === 'string') {
    return false
  }

  return node[0] === null || node[0] === 'template'
}

/**
 * Tags whose children this renderer resolves through {@link BLOCK_TAGS}.
 *
 * Comark hands a component only its rendered React children, which carry no
 * indication of whether they came out inline or block. Recovering that needs the
 * source node, which is why the components asking for this set
 * {@link withNode}.
 */
export function childNodes(node: ElementNode | undefined): Node[] {
  if (!node) {
    return []
  }

  return (node.slice(2) as Node[]).filter((child) => !rendersNothing(child))
}

/**
 * The node whose children line up with what a component received as `children`.
 *
 * For a component written with named slots, Comark passes the `#default`
 * template's children as `children` while the node's own children are the
 * `template` elements — so pairing against the node itself would misalign. This
 * resolves to the default template when one is present, and is a no-op
 * otherwise.
 */
export function contentNode(node: ElementNode | undefined): ElementNode | undefined {
  if (!node) {
    return undefined
  }

  const templates = (node.slice(2) as Node[]).filter(
    (child): child is ElementNode => isElementNode(child) && child[0] === 'template'
  )

  if (templates.length === 0) {
    return node
  }

  return templates.find((template) => (template[1]?.name ?? 'default') === 'default') ?? node
}

/**
 * Marks a component as wanting the raw Comark node on a `__node` prop.
 *
 * Comark's React walker only passes it when `propTypes.__node` is defined
 * (`MarkdownDocument.tsx`), so this is the documented opt-in rather than a
 * private hook. React 19 no longer validates `propTypes`, so the object is
 * inert beyond acting as that flag.
 */
export function withNode<P extends { __node?: ElementNode }>(component: React.FC<P>): React.FC<P> {
  ;(component as { propTypes?: unknown }).propTypes = { __node: null }

  return component
}
