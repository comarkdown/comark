import type { MDCRoot } from '../src/types/tree'
import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

interface ParseResult {
  body: MDCRoot
  excerpt?: MDCRoot
  data: any
  toc?: any
}

describe('parse - empty content', () => {
  it('should handle empty string', () => {
    const content = ''
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('root')
  })

  it('should handle whitespace only content', () => {
    const content = '   \n\n\t  '
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('root')
  })

  it('should handle newlines only', () => {
    const content = '\n\n\n'
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('root')
  })
})
