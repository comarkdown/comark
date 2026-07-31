import { describe, expect, it } from 'vitest'
import { getCaret, findLastTextNodeAndAppendNode } from '../src/utils/caret.ts'
import type { ComarkElement } from 'comark'

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
      const parent: ComarkElement = ['p', {}, 'Hello world']
      const caret: ComarkElement = ['span', { key: 'stream-caret' }, ' ']
      const result = findLastTextNodeAndAppendNode(parent, caret)
      expect(result).toBe(true)
      expect(parent.length).toBe(4)
    })

    it('traverses nested elements', () => {
      const nested: ComarkElement = ['strong', {}, 'bold text']
      const parent: ComarkElement = ['p', {}, nested]
      const caret: ComarkElement = ['span', { key: 'stream-caret' }, ' ']
      const result = findLastTextNodeAndAppendNode(parent, caret)
      expect(result).toBe(true)
    })

    it('returns false for empty parent', () => {
      const parent: ComarkElement = ['p', {}]
      const caret: ComarkElement = ['span', { key: 'stream-caret' }, ' ']
      const result = findLastTextNodeAndAppendNode(parent, caret)
      expect(result).toBe(false)
    })
  })
})
