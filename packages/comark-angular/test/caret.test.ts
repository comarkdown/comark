import { describe, expect, it } from 'vitest'
import { getCaret, findLastTextNodeAndAppendNode } from '../src/utils/caret.ts'
import type { MarkdownElement } from 'comark'

describe('caret utils', () => {
  describe('getCaret', () => {
    it('returns null for false', () => {
      expect(getCaret(false)).toBeNull()
    })

    it('returns a span element for true', () => {
      const caret = getCaret(true)
      expect(caret).toBeTruthy()
      expect(caret![0]).toBe('span')
      expect(caret![1]).toHaveProperty('key', 'stream-caret')
    })

    it('returns a span element with custom class', () => {
      const caret = getCaret({ class: 'my-caret' })
      expect(caret).toBeTruthy()
      expect(caret![0]).toBe('span')
      expect(caret![1]).toHaveProperty('class', 'my-caret')
    })
  })

  describe('findLastTextNodeAndAppendNode', () => {
    it('appends to parent with text child', () => {
      const parent: MarkdownElement = ['p', {}, 'Hello world']
      const caret: MarkdownElement = ['span', { key: 'stream-caret' }, ' ']
      const result = findLastTextNodeAndAppendNode(parent, caret)
      expect(result).toBe(true)
      expect(parent.length).toBe(4)
    })

    it('traverses nested elements', () => {
      const nested: MarkdownElement = ['strong', {}, 'bold text']
      const parent: MarkdownElement = ['p', {}, nested]
      const caret: MarkdownElement = ['span', { key: 'stream-caret' }, ' ']
      const result = findLastTextNodeAndAppendNode(parent, caret)
      expect(result).toBe(true)
    })

    it('returns false for empty parent', () => {
      const parent: MarkdownElement = ['p', {}]
      const caret: MarkdownElement = ['span', { key: 'stream-caret' }, ' ']
      const result = findLastTextNodeAndAppendNode(parent, caret)
      expect(result).toBe(false)
    })
  })
})
