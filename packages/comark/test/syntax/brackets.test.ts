import { describe, expect, it } from 'vitest'
import { findClosingBracket, parseBracketContent } from '../../src/internal/parse/syntax/brackets'

describe('findClosingBracket', () => {
  it('should find the closing bracket', () => {
    expect(findClosingBracket('[hello]', 0)).toBe(6)
  })

  it('should skip nested bracket pairs', () => {
    expect(findClosingBracket('[a [b] c]', 0)).toBe(8)
  })

  it('should skip escaped brackets', () => {
    expect(findClosingBracket('[a \\] b]', 0)).toBe(7)
  })

  it('should return -1 when unclosed', () => {
    expect(findClosingBracket('[a [b]', 0)).toBe(-1)
  })

  it('should return -1 when not at an opening bracket', () => {
    expect(findClosingBracket('a]', 0)).toBe(-1)
  })

  it('should work with non-zero start index', () => {
    expect(findClosingBracket('prefix[content]', 6)).toBe(14)
  })
})

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

  it('should include nested bracket pairs in the content', () => {
    expect(parseBracketContent('[a [b] c]', 0)).toEqual({ content: 'a [b] c', endIndex: 9 })
  })

  it('should include an image in the content', () => {
    expect(parseBracketContent('[![alt](i.png)]', 0)).toEqual({ content: '![alt](i.png)', endIndex: 15 })
  })

  it('should include multiple nested pairs in the content', () => {
    expect(parseBracketContent('[[a] and [b]]', 0)).toEqual({ content: '[a] and [b]', endIndex: 13 })
  })

  it('should return null when a nested pair is left unclosed', () => {
    expect(parseBracketContent('[a [b]', 0)).toBeNull()
  })
})
