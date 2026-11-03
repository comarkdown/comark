import type { ElementNode, Node } from 'comark'
import { defineComarkPlugin } from 'comark'
import { visitAsync } from 'comark/utils'
import {
  createTagFilter,
  isTagSelector,
  isUnsafeTagSelector,
  sanitizeData,
  validateProps,
} from '../internal/sanitize.ts'
import type { PropsValidationOptions } from '../internal/sanitize.ts'

interface SecurityOptions extends PropsValidationOptions {
  /**
   * Tags to remove entirely from the output tree.
   * @default []
   */
  blockedTags?: string[]

  /**
   * Tags to allow only in the output tree.
   * @default []
   */
  allowedTags?: string[]

  /**
   * Behavior when encountering an unallowed or blocked tag.
   * @default undefined
   */
  tagFallback?: (element: ElementNode) => false | Node | Promise<false | Node>

  /**
   * Sanitize frontmatter too: renderers spread it into components, so it gets the prop rules at any depth.
   * @default true
   */
  frontmatter?: boolean
}

export default defineComarkPlugin((options: SecurityOptions = {}) => {
  const {
    blockedTags = [],
    allowedTags = [],
    tagFallback = undefined,
    frontmatter = true,
    allowedLinkPrefixes,
    allowedImagePrefixes,
    allowedProtocols,
    defaultOrigin,
    allowDataImages,
  } = options

  const dropSet = new Set(blockedTags.map((t) => t.toLowerCase()))
  const allowSet = new Set(allowedTags.map((t) => t.toLowerCase()))
  const isFilteredTag = createTagFilter(blockedTags, allowedTags)

  const propsOptions: PropsValidationOptions = {
    allowedLinkPrefixes,
    allowedImagePrefixes,
    allowedProtocols,
    defaultOrigin,
    allowDataImages,
  }

  return {
    name: 'security',
    async post(state) {
      await visitAsync(
        state.tree,
        (node) => typeof node !== 'string' && node[0] !== null,
        async (node) => {
          const element = node as ElementNode
          const tagName = element[0].toLowerCase()

          const isBlocked = dropSet.has(tagName)
          const isNotAllowed = allowSet.size > 0 && !allowSet.has(tagName)

          if (isNotAllowed || isBlocked) {
            if (typeof tagFallback === 'function') {
              return await tagFallback(element)
            }

            // return false to remove the node from the tree
            return false
          }

          // `as` and `is` make renderers resolve a different component than the element's own tag.
          // Hold them, bindings included, to the same tag filters: otherwise `[x]{as="AdminPanel"}` bypasses them.
          for (const key of Object.keys(element[1])) {
            if (isTagSelector(key) && isUnsafeTagSelector(key, element[1][key], isFilteredTag)) {
              console.warn(`[comark/plugins/security] removing unsafe attribute: ${key}="${element[1][key]}"`)
              delete element[1][key]
            }
          }

          const keys = Object.keys(element[1])

          /**
           * If the element has any props, validate them
           */
          if (keys.length) {
            element[1] = validateProps(element[0], element[1], propsOptions)
          }
        }
      )

      if (frontmatter) {
        const removed = sanitizeData(state.tree.frontmatter, { ...propsOptions, blockedTags, allowedTags })
        for (const path of removed) {
          console.warn(`[comark/plugins/security] removing unsafe frontmatter: ${path}`)
        }
      }
    },
  }
})
