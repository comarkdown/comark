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
 * Headings without an `id` are left unchanged, and with `'wrap'` so are headings that
 * already contain a link, since links cannot be nested. Added links are marked with
 * `$.permalink`, so Markdown output leaves them out, and `toc` and `title-description`
 * leave a separate `'prepend'` or `'append'` link out of heading text.
 *
 * Don't combine this plugin with heading components that already add a link at render time,
 * such as Nuxt UI's `ProseH2`. The plugin can't see those components, so each heading
 * would end up with two nested links.
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

          const href = `#${attrs.id}`

          if (behavior === 'wrap') {
            if (children.some(containsLink)) return
            return [tag, attrs, ['a', { ...props, href, $: { permalink: 'wrap' } }, ...children]]
          }

          // Streaming parses run `post` again over headings reused from the previous tree.
          if (children.some((child) => Array.isArray(child) && child[1]?.$?.permalink === 'separate')) return

          const anchor: ElementNode = [
            'a',
            { ...props, href, $: { permalink: 'separate' } },
            ...structuredClone(content),
          ]
          return behavior === 'prepend' ? [tag, attrs, anchor, ...children] : [tag, attrs, ...children, anchor]
        }
      )
    },
  }
})
