import type { ElementNode, Node } from 'comark'

interface CaretOptions {
  class?: string
}

const CARET_KEY = 'stream-caret'
const CARET_TEXT = ' ' // thin space is used to avoid wide spaces between text and caret
const CARET_STYLE =
  'background-color: currentColor; display: inline-block; margin-left: 0.25rem; margin-right: 0.25rem; animation: pulse 0.75s cubic-bezier(0.4,0,0.6,1) infinite;'

export function getCaret(options: boolean | CaretOptions): ElementNode | null {
  if (options === true) {
    return ['span', { key: CARET_KEY, style: CARET_STYLE }, CARET_TEXT]
  }
  if (typeof options === 'object') {
    const userClass = options?.class || ''
    return [
      'span',
      {
        key: CARET_KEY,
        style: CARET_STYLE,
        ...(userClass ? { class: userClass } : {}),
      },
      CARET_TEXT,
    ]
  }

  return null
}

function isCaret(node: Node): boolean {
  return Array.isArray(node) && node[1]?.key === CARET_KEY
}

/**
 * Return a copy of `node` with `caret` appended to the element holding its last
 * text node, or `null` when it contains no text.
 *
 * Copies rather than mutates. The caller's `nodes` array is only ever shallow
 * copied, so writing into a node would write into the parsed document itself:
 * the caret would survive into whatever else holds that document, and every
 * further call would append another one — a settled document accumulated a caret
 * per re-render, each with the same React key.
 *
 * Only the nodes along the path to that text node are rebuilt; the rest of the
 * tree is shared, so this stays cheap enough to run on every streamed delta.
 */
export function appendCaretToLastTextNode(parent: ElementNode, caret: ElementNode): ElementNode | null {
  // Backwards: the caret belongs after the last text in the document.
  for (let i = parent.length - 1; i >= 2; i--) {
    const node = parent[i]

    // Already anchored here. Returning the node unchanged keeps the result
    // truthy, so a caller that re-runs over its own output is a no-op.
    if (isCaret(node as Node)) {
      return parent
    }

    if (typeof node === 'string') {
      return [...parent, caret] as ElementNode
    }

    if (Array.isArray(node)) {
      const replaced = appendCaretToLastTextNode(node as ElementNode, caret)

      if (replaced === node) {
        return parent
      }

      if (replaced) {
        const copy = [...parent] as ElementNode
        copy[i] = replaced

        return copy
      }
    }
  }

  return null
}
