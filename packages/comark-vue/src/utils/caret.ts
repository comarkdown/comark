import type { ElementNode, Node } from 'comark'

interface CaretOptions {
  class?: string
}

const CARET_TEXT = ' ' // thin space is used to avoid wide spaces between text and caret
const CARET_STYLE =
  'background-color: currentColor; display: inline-block; margin-left: 0.25rem; margin-right: 0.25rem; animation: pulse 0.75s cubic-bezier(0.4,0,0.6,1) infinite;'

export function getCaret(options: boolean | CaretOptions): ElementNode | null {
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

export function appendCaretToLastTextNode(parent: Node, caret: ElementNode): ElementNode | null {
  if (!Array.isArray(parent) || parent[0] === null || parent[1]?.key === 'stream-caret') {
    return null
  }

  for (let i = parent.length - 1; i >= 2; i--) {
    const node = parent[i] as Node
    if (typeof node === 'string') {
      return [...parent, caret]
    }

    const child = appendCaretToLastTextNode(node, caret)
    if (child) {
      const copy: ElementNode = [...parent]
      copy[i] = child
      return copy
    }
  }

  return null
}
