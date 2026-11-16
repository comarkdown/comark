import type { ElementNode } from 'comark'
import { defineComarkPlugin } from 'comark'
import { visit } from 'comark/utils'

export interface ExternalLinksOptions {
  /**
   * `rel` added to external links that don't set one.
   * @default 'nofollow'
   */
  rel?: string
}

const EXTERNAL_LINK_RE = /^https?:\/\//i

/**
 * Adds a `rel` to external (`http://` and `https://`) links that don't set one, `nofollow` by default.
 *
 * `[Nuxt](https://nuxt.com)` becomes `<a href="https://nuxt.com" rel="nofollow">Nuxt</a>`.
 * A `rel` the author wrote, such as `{rel="sponsored"}`, is kept. The added value is recorded
 * in `$.autoRel`, so Markdown output leaves it out and the source round-trips unchanged.
 *
 * @example
 * ```ts
 * externalLinks()
 *
 * externalLinks({ rel: 'nofollow noopener' })
 * ```
 */
export default defineComarkPlugin<ExternalLinksOptions>((options = {}) => {
  const { rel = 'nofollow' } = options

  return {
    name: 'external-links',
    post(state) {
      visit(
        state.tree,
        (node) => Array.isArray(node) && node[0] === 'a',
        (node) => {
          const [tag, attrs, ...children] = node as ElementNode
          if (typeof attrs.href !== 'string' || !EXTERNAL_LINK_RE.test(attrs.href)) return
          // A bound `:rel` resolves to `rel` at render time, so the author set it
          if (attrs.rel !== undefined || attrs[':rel'] !== undefined) return
          return [tag, { ...attrs, rel, $: { ...attrs.$, autoRel: rel } }, ...children]
        }
      )
    },
  }
})
