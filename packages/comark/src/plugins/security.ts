import type { ComarkElement } from '../ast/types'
import { visit } from '../ast/utils'
import { validateProps } from '../internal/props-validation'
import type { ComarkPlugin } from '../types'

interface SecurityOptions {
  drop?: string[]
}

export default function security(options: SecurityOptions): ComarkPlugin {
  const { drop = [] } = options

  const dropTags = new Set(drop)

  return {
    post(state) {
      visit(
        state.tree,
        node => typeof node !== 'string' && node[0] !== null,
        (node) => {
          const element = node as ComarkElement

          // return false to remove the node from the tree
          if (dropTags.has(element[0])) {
            return false
          }

          const keys = Object.keys(element[1])

          /**
           * If the element has any props, validate them
           */
          if (keys.length) {
            return [element[0], validateProps(element[0], element[1]), ...element.slice(2)] as ComarkElement
          }

          return element
        })
    },
  }
}
