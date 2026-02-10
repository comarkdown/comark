import type { MinimarkElement } from 'minimark'

interface CaretOptions {
  class?: string
}

export function getCaret(options: boolean | CaretOptions): MinimarkElement | null {
  if (options === true) {
    return ['span', { key: 'stream-caret', class: 'bg-white w-1 h-6 inline-block mb-[-2px] mx-1 animate-[pulse_0.75s_cubic-bezier(0.4,0,0.6,1)_infinite]' }]
  }
  if (typeof options === 'object') {
    return ['span', {
      key: 'stream-caret',
      class: 'bg-white w-1 h-6 inline-block mb-[-2px] mx-1 animate-[pulse_0.75s_cubic-bezier(0.4,0,0.6,1)_infinite] ' + (options?.class || ''),
    }]
  }

  return null
}

export function findLastTextNodeAndAppendNode(parent: MinimarkElement, nodeToAppend: MinimarkElement): boolean {
  // Traverse nodes backwards to find the last text node
  for (let i = parent.length - 1; i >= 2; i--) {
    const node = parent[i]

    if (typeof node === 'string') {
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
