import type { ComarkElement, ComarkPlugin } from 'comark'
import { visit } from 'comark/utils'
import { validateProps } from '../internal/props-validation'
import type { PropsValidationOptions } from '../internal/props-validation'

interface SecurityOptions extends PropsValidationOptions {
  /**
   * Tags to remove entirely from the output tree.
   * @default []
   */
  blockedTags?: string[]
}

export default function security(options: SecurityOptions): ComarkPlugin {
  const {
    blockedTags = [],
    allowedLinkPrefixes,
    allowedImagePrefixes,
    allowedProtocols,
    defaultOrigin,
    allowDataImages,
  } = options

  const dropSet = new Set(blockedTags.map(t => t.toLowerCase()))

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
        node => typeof node !== 'string' && node[0] !== null,
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
        })
    },
  }
}
