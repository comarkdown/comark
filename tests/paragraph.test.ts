import type { MDCElement, MDCRoot } from '../src/types/tree'
import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

interface ParseResult {
  body: MDCRoot
  excerpt?: MDCRoot
  data: any
  toc?: any
}

describe('parse - paragraphs', () => {
  it('should parse paragraph text', () => {
    const content = 'This is a paragraph.'
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)
  })

  it('should parse multiple paragraphs', () => {
    const content = 'First paragraph.\n\nSecond paragraph.'
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    expect(result.body.children.length).toBeGreaterThanOrEqual(1)
  })

  it('should parse paragraph with text content', () => {
    const content = 'This is a simple paragraph with some text.'
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    const paragraph = result.body.children.find(
      child => child.type === 'element' && child.tag === 'p',
    ) as MDCElement | undefined
    expect(paragraph).toBeDefined()
  })
})
