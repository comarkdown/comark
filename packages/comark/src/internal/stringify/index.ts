import { createState, one } from './state'
import type { StringifyOptions } from './types'
import type { ComarkTree } from '../../ast/types'

const defaultOptions: Partial<StringifyOptions> = {
  format: 'markdown/mdc',
  removeLastStyle: true,
}

export function stringify(node: ComarkTree, options: Partial<StringifyOptions> = {}) {
  options = {
    blockSeparator: options.format === 'text/html' ? '\n' : '\n\n',
    ...defaultOptions,
    ...options,
  }

  const _state = createState(options)

  const children = node.value

  const lastIndex = children.length - 1

  return children.map((child, index) => {
    if (index === lastIndex && options.removeLastStyle && child[0] === 'style') {
      return ''
    }
    return one(child, _state)
  }).join('').trim() + '\n'
}
