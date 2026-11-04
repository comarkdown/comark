import type { ElementNode, Node } from 'comark'
import { defineComarkPlugin } from 'comark'
import { visit } from 'comark/utils'

export interface HeadingLinksOptions {
  /**
   * Heading tags that get a link.
   * @default ['h2', 'h3', 'h4']
   */
  tags?: string[]
  /**
   * Where the link goes:
   * - `'wrap'`: the link wraps the heading content.
   * - `'prepend'`: the link is inserted before the heading content.
   * - `'append'`: the link is inserted after the heading content.
   * @default 'wrap'
   */
  behavior?: 'wrap' | 'prepend' | 'append'
  /**
   * Content of the link for `'prepend'` and `'append'`. Ignored for `'wrap'`.
   * @default ['#']
   */
  content?: Node[]
  /**
   * Extra props for the link, such as `{ class: 'heading-link' }`.
   * `href` is always set from the heading `id`.
   */
  props?: Record<string, unknown>
}

function containsLink(node: Node): boolean {
  if (!Array.isArray(node)) return false
  if (node[0] === 'a') return true
  return node.slice(2).some((child) => containsLink(child as Node))
}

/**
 * Links each heading to itself, using the `id` the parser gives every heading.
 *
 * By default `h2` to `h4` headings are wrapped in a link to their own `id`:
 * `## Setup` becomes `<h2 id="setup"><a href="#setup">Setup</a></h2>`.
 * Headings anywhere in the tree are linked, including inside components.
 * Headings without an `id` or that already link to themselves are left unchanged, and
 * with `'wrap'` so are headings that already contain a link, since links cannot be nested.
 *
 * Pick either this plugin or heading components that add their own link at render time,
 * such as Nuxt UI's `ProseH2`. The plugin can't see those components, so using both
 * renders two nested links in each heading.
 *
 * @example
 * ```ts
 * // Default — wrap h2, h3 and h4 content in a link
 * headingLinks()
 *
 * // Add a `#` link before the heading text instead
 * headingLinks({ behavior: 'prepend', props: { class: 'heading-link' } })
 *
 * // Link every heading level
 * headingLinks({ tags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] })
 * ```
 */
export default defineComarkPlugin<HeadingLinksOptions>((options = {}) => {
  const { tags = ['h2', 'h3', 'h4'], behavior = 'wrap', content = ['#'], props = {} } = options
  const headingTags = new Set(tags)

  return {
    name: 'heading-links',
    post(state) {
      visit(
        state.tree,
        (node) => Array.isArray(node) && headingTags.has(node[0] as string),
        (node) => {
          const [tag, attrs, ...children] = node as ElementNode
          if (typeof attrs.id !== 'string' || attrs.id === '') return

          // Streaming parses run `post` again over headings reused from the previous tree.
          const href = `#${attrs.id}`
          if (children.some((child) => Array.isArray(child) && child[0] === 'a' && child[1]?.href === href)) return

          const link = (linkChildren: Node[]): ElementNode => ['a', { ...props, href }, ...linkChildren]

          if (behavior === 'wrap') {
            if (children.some(containsLink)) return
            return [tag, attrs, link(children)]
          }

          const anchor = link(structuredClone(content))
          return behavior === 'prepend' ? [tag, attrs, anchor, ...children] : [tag, attrs, ...children, anchor]
        }
      )
    },
  }
})
