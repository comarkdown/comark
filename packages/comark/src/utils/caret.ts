import type { ComarkElement } from 'comark/ast'

interface CaretOptions {
  class?: string
}

const CARET_TEXT = ' ' // thin space is used to avoid wide spaces between text and caret
const CARET_STYLE = 'background-color: currentColor; display: inline-block; margin-left: 0.25rem; margin-right: 0.25rem; animation: pulse 0.75s cubic-bezier(0.4,0,0.6,1) infinite;'

export function getCaret(options: boolean | CaretOptions): ComarkElement | null {
  if (options === true) {
    return ['span', { key: 'stream-caret', style: CARET_STYLE }, CARET_TEXT]
  }
  if (typeof options === 'object') {
    const userClass = options?.class || ''
    return [
      'span',
      {
        key: 'stream-caret',
        style: CARET_STYLE,
        ...(userClass ? { class: userClass } : {}),
      },
      CARET_TEXT,
    ]
  }

  return null
}

export function findLastTextNodeAndAppendNode(parent: ComarkElement, nodeToAppend: ComarkElement): boolean {
  // Traverse nodes backwards to find the last text node
  for (let i = parent.length - 1; i >= 2; i--) {
    const node = parent[i]

    if (typeof node === 'string' && parent[1]?.key !== 'stream-caret') {
      // Found a text node - insert stream indicator after it
      parent.push(nodeToAppend)

      return true
    }

    if (Array.isArray(node)) {
      // This is an element node - recursively check its children
      if (findLastTextNodeAndAppendNode(node, nodeToAppend)) {
        return true
      }
    }
  }

  return false
}
