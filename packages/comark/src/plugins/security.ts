import type { ElementNode, Node } from 'comark'
import { defineComarkPlugin } from 'comark'
import { visitAsync } from 'comark/utils'
import { isTagSelector, sanitizeData, unsafeTags, validateProps } from '../internal/sanitize.ts'
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

/** A tag name an `as` or `is` value may name: letters, digits, `_` and `-` only. */
const RE_TAG_NAME = /^[\w-]+$/

/** Whether `key` binds an object of props at once: `v-bind`, `v-bind:` or `:`. */
function isObjectBinding(key: string): boolean {
  return key === ':' || key === 'v-bind' || key === 'v-bind:'
}

/** Whether an object binding can set `as` or `is`: it holds one, or only render-time data decides. */
function bindsTagSelector(value: unknown): boolean {
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return true
    }
  }
  if (typeof value !== 'object' || value === null) return false
  return Object.keys(value).some(isTagSelector)
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

          // `as` and `is` change the tag renderers create, so the element is checked as each tag it names:
          // otherwise `[x]{as="AdminPanel"}` bypasses the tag filters. Its own tag is checked too, as
          // renderers fall back to it when no component matches the `as` value.
          const tagNames = [element[0].toLowerCase()]
          for (const key of Object.keys(element[1])) {
            const value = element[1][key]
            const isLiteral = key === 'as' || key === 'is'
            if (isLiteral && typeof value === 'string' && RE_TAG_NAME.test(value)) {
              tagNames.push(value.toLowerCase())
              continue
            }
            if (!isLiteral && !isTagSelector(key) && !(isObjectBinding(key) && bindsTagSelector(value))) continue
            // A bound selector (`:as`, `v-bind:is`, `v-bind="{ as }"`) names its tag only at render
            // time, after every check, and a non-string or malformed one names no valid tag.
            console.warn(`[comark/plugins/security] removing unsafe attribute: ${key}="${value}"`)
            delete element[1][key]
          }

          const isBlocked = tagNames.some((tag) => dropSet.has(tag))
          const isNotAllowed = allowSet.size > 0 && tagNames.some((tag) => !allowSet.has(tag))

          if (isNotAllowed || isBlocked) {
            if (typeof tagFallback === 'function') {
              return await tagFallback(element)
            }

            // return false to remove the node from the tree
            return false
          }

          const keys = Object.keys(element[1])

          /**
           * If the element has any props, validate them
           */
          if (keys.length) {
            const type = tagNames.find((tag) => unsafeTags.includes(tag)) ?? tagNames[0]
            element[1] = validateProps(type, element[1], propsOptions)
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
