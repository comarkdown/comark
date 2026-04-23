import type { ComarkElement } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { visit } from '../utils/index.ts'
import { validateProps } from '../internal/props-validation.ts'
import type { PropsValidationOptions } from '../internal/props-validation.ts'

interface SecurityOptions extends PropsValidationOptions {
  /**
   * Tags to remove entirely from the output tree.
   * @default []
   */
  blockedTags?: string[]
}

export default defineComarkPlugin((options: SecurityOptions = {}) => {
  const {
    blockedTags = [],
    allowedLinkPrefixes,
    allowedImagePrefixes,
    allowedProtocols,
    defaultOrigin,
    allowDataImages,
  } = options

  const dropSet = new Set(blockedTags.map((t) => t.toLowerCase()))

  const propsOptions: PropsValidationOptions = {
    allowedLinkPrefixes,
    allowedImagePrefixes,
    allowedProtocols,
    defaultOrigin,
    allowDataImages,
  }

  return {
    name: 'security',
    post(state) {
      visit(
        state.tree,
        (node) => typeof node !== 'string' && node[0] !== null,
        (node) => {
          const element = node as ComarkElement

          // return false to remove the node from the tree
          if (dropSet.has(element[0].toLowerCase())) {
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
