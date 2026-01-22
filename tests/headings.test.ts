import type { MDCElement, MDCRoot } from '../src/types/tree'
import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

interface ParseResult {
  body: MDCRoot
  excerpt?: MDCRoot
  data: any
  toc?: any
}

describe('parse - headings', () => {
  it('should parse simple markdown heading', () => {
    const content = '# Hello World'
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('root')
    expect(result.body.children).toBeDefined()
    expect(Array.isArray(result.body.children)).toBe(true)
  })

  it('should parse headings with generated ids', () => {
    const content = '# My Heading'
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    const heading = result.body.children.find(
      child => child.type === 'element' && child.tag === 'h1',
    ) as MDCElement | undefined
    expect(heading).toBeDefined()
    expect(heading?.props?.id).toBeDefined()
  })

  it('should parse multiple heading levels', () => {
    const content = '# H1 Heading\n## H2 Heading\n### H3 Heading'
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    const h1 = result.body.children.find(
      child => child.type === 'element' && child.tag === 'h1',
    ) as MDCElement | undefined
    const h2 = result.body.children.find(
      child => child.type === 'element' && child.tag === 'h2',
    ) as MDCElement | undefined
    const h3 = result.body.children.find(
      child => child.type === 'element' && child.tag === 'h3',
    ) as MDCElement | undefined

    expect(h1).toBeDefined()
    expect(h2).toBeDefined()
    expect(h3).toBeDefined()
    expect(h1?.props?.id).toBeDefined()
    expect(h2?.props?.id).toBeDefined()
    expect(h3?.props?.id).toBeDefined()
  })
})
