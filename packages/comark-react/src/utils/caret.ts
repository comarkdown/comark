import type { ComarkElement } from 'comark'

interface CaretOptions {
  class?: string
}

const CARET_TEXT = ' ' // thin space is used to avoid wide spaces between text and caret
// Geometry + animation only. The `comark-caret-pulse` keyframe is namespaced to
// avoid colliding with Tailwind's `pulse` and ships in `@comark/react/streamdown.css`.
const CARET_GEOMETRY =
  'display: inline-block; margin-left: 0.25rem; margin-right: 0.25rem; animation: comark-caret-pulse 0.75s cubic-bezier(0.4,0,0.6,1) infinite;'
// Default fill, kept inline so the boolean caret stays self-contained (no stylesheet required).
const CARET_FILL = 'background-color: currentColor; '

export function getCaret(options: boolean | CaretOptions): ComarkElement | null {
  if (options === true) {
    return ['span', { key: 'stream-caret', style: CARET_FILL + CARET_GEOMETRY }, CARET_TEXT]
  }
  if (typeof options === 'object') {
    const userClass = options?.class || ''
    // No inline background-color here: a custom class (e.g. the `circle` shape) can
    // then own the fill via the stylesheet without needing !important to beat it.
    return [
      'span',
      {
        key: 'stream-caret',
        style: CARET_GEOMETRY,
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
      if (findLastTextNodeAndAppendNode(node as ComarkElement, nodeToAppend)) {
        return true
      }
    }
  }

  return false
}
