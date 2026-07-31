import { describe, expect, it } from 'vitest'
import { isMarkdownTree } from '../src/utils/index.ts'

describe('isMarkdownTree', () => {
  it('returns true for a full MarkdownTree', () => {
    expect(isMarkdownTree({ nodes: [], frontmatter: {}, meta: {} })).toBe(true)
  })

  it('returns true for a bare { nodes } object', () => {
    expect(isMarkdownTree({ nodes: [['p', {}, 'hi']] })).toBe(true)
  })

  it('returns false for strings', () => {
    expect(isMarkdownTree('# hello')).toBe(false)
    expect(isMarkdownTree('')).toBe(false)
  })

  it('returns false for nullish and non-objects', () => {
    expect(isMarkdownTree(null)).toBe(false)
    expect(isMarkdownTree(undefined)).toBe(false)
    expect(isMarkdownTree(42)).toBe(false)
    expect(isMarkdownTree([])).toBe(false)
  })

  it('returns false for objects without a nodes array', () => {
    expect(isMarkdownTree({ frontmatter: {}, meta: {} })).toBe(false)
    expect(isMarkdownTree({ nodes: 'not-an-array' })).toBe(false)
  })
})
