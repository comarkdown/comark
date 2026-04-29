import { describe, expect, it } from 'vitest'
import { parseBracketContent } from '../../src/internal/parse/syntax/brackets'

describe('parseBracketContent', () => {
  it('should parse simple bracket content', () => {
    expect(parseBracketContent('[hello]', 0)).toEqual({ content: 'hello', endIndex: 7 })
  })

  it('should handle escaped brackets', () => {
    expect(parseBracketContent('[hello \\] world]', 0)).toEqual({ content: 'hello \\] world', endIndex: 16 })
  })

  it('should handle escaped backslashes', () => {
    expect(parseBracketContent('[hello \\\\ world]', 0)).toEqual({ content: 'hello \\\\ world', endIndex: 16 })
  })

  it('should return null if no opening bracket', () => {
    expect(parseBracketContent('hello]', 0)).toBeNull()
  })

  it('should return null if no closing bracket', () => {
    expect(parseBracketContent('[hello', 0)).toBeNull()
  })

  it('should handle empty content', () => {
    expect(parseBracketContent('[]', 0)).toEqual({ content: '', endIndex: 2 })
  })

  it('should work with non-zero start index', () => {
    expect(parseBracketContent('prefix[content]suffix', 6)).toEqual({ content: 'content', endIndex: 15 })
  })
})
