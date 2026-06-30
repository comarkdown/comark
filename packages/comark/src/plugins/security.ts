import type { ComarkElement } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { visitAsync } from '../utils/index.ts'
import { validateProps } from '../internal/props-validation.ts'
import type { PropsValidationOptions } from '../internal/props-validation.ts'

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
  tagFallback?: undefined | ((element: ComarkElement) => any | Promise<any>)
}

export default defineComarkPlugin((options: SecurityOptions = {}) => {
  const {
    blockedTags = [],
    allowedTags = [],
    tagFallback = undefined,
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
          const element = node as ComarkElement
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

          const keys = Object.keys(element[1])

          /**
           * If the element has any props, validate them
           */
          if (keys.length) {
            element[1] = validateProps(element[0], element[1], propsOptions)
          }
        }
      )
    },
  }
})
