import { describe, expect, it } from 'vitest'
import { isMarkdownDocument } from '../src/utils/index.ts'

describe('isMarkdownDocument', () => {
  it('returns true for a full MarkdownDocument', () => {
    expect(isMarkdownDocument({ nodes: [], frontmatter: {}, meta: {} })).toBe(true)
  })

  it('returns true for a bare { nodes } object', () => {
    expect(isMarkdownDocument({ nodes: [['p', {}, 'hi']] })).toBe(true)
  })

  it('returns false for strings', () => {
    expect(isMarkdownDocument('# hello')).toBe(false)
    expect(isMarkdownDocument('')).toBe(false)
  })

  it('returns false for nullish and non-objects', () => {
    expect(isMarkdownDocument(null)).toBe(false)
    expect(isMarkdownDocument(undefined)).toBe(false)
    expect(isMarkdownDocument(42)).toBe(false)
    expect(isMarkdownDocument([])).toBe(false)
  })

  it('returns false for objects without a nodes array', () => {
    expect(isMarkdownDocument({ frontmatter: {}, meta: {} })).toBe(false)
    expect(isMarkdownDocument({ nodes: 'not-an-array' })).toBe(false)
  })
})
