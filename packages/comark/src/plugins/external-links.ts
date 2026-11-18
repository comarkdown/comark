import type { ElementNode, ElementNodeAttributes } from 'comark'
import { defineComarkPlugin } from 'comark'
import { visit } from 'comark/utils'

export interface ExternalLinksOptions {
  /**
   * `rel` added to external links that don't set one.
   * @default 'nofollow', or 'nofollow noopener noreferrer' on links that open a new tab
   */
  rel?: string
  /**
   * `target` added to external links that don't set one, such as `'_blank'`.
   * @default undefined
   */
  target?: string
}

// `http://`, `https://`, and protocol-relative `//` URLs
const EXTERNAL_LINK_RE = /^(?:https?:)?\/\//i
// Targets that navigate an existing browsing context, so `window.opener` isn't set (keywords are case-insensitive)
const SAME_CONTEXT_TARGETS = new Set(['', '_self', '_parent', '_top'])

/**
 * Adds a `rel` to external (`http://`, `https://`, and `//`) links that don't set one, `nofollow` by default.
 *
 * `[Nuxt](https://nuxt.com)` becomes `<a href="https://nuxt.com" rel="nofollow">Nuxt</a>`.
 * With `target`, links also get that `target`. On links that open a new tab, the default `rel` adds `noopener noreferrer`.
 * A `rel` or `target` the author wrote, such as `{rel="sponsored"}`, is kept. Added values are recorded
 * in `$.autoRel` and `$.autoTarget`, so Markdown output leaves them out and the source round-trips unchanged.
 *
 * @example
 * ```ts
 * externalLinks()
 *
 * externalLinks({ target: '_blank' })
 * ```
 */
export default defineComarkPlugin<ExternalLinksOptions>((options = {}) => {
  const { target, rel } = options

  return {
    name: 'external-links',
    post(state) {
      visit(
        state.tree,
        (node) => Array.isArray(node) && node[0] === 'a',
        (node) => {
          const [tag, attrs, ...children] = node as ElementNode
          if (typeof attrs.href !== 'string' || !EXTERNAL_LINK_RE.test(attrs.href)) return
          // A bound `:rel` or `:target` resolves at render time, so the author set it
          const addRel = attrs.rel === undefined && attrs[':rel'] === undefined
          const addTarget = target !== undefined && attrs.target === undefined && attrs[':target'] === undefined
          if (!addRel && !addTarget) return

          const $ = { ...attrs.$ }
          const next: ElementNodeAttributes = { ...attrs, $ }
          if (addRel) {
            // A bound `:target` can't be checked at parse time, so it counts as a new tab
            const linkTarget = addTarget ? target : (attrs.target ?? attrs[':target'])
            const newContext = linkTarget !== undefined && !SAME_CONTEXT_TARGETS.has(String(linkTarget).toLowerCase())
            const linkRel = rel ?? (newContext ? 'nofollow noopener noreferrer' : 'nofollow')
            next.rel = linkRel
            $.autoRel = linkRel
          }
          if (addTarget) {
            next.target = target
            $.autoTarget = target
          }
          return [tag, next, ...children]
        }
      )
    },
  }
})
