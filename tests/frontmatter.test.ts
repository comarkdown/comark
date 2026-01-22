import type { MDCRoot } from '../src/types/tree'
import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

interface ParseResult {
  body: MDCRoot
  excerpt?: MDCRoot
  data: any
  toc?: any
}

describe('parse - frontmatter', () => {
  it('should parse YAML frontmatter', () => {
    const content = `---
title: My Title
description: My Description
---
# Content`
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    expect(result.data).toBeDefined()
    expect(result.data.title).toBe('My Title')
    expect(result.data.description).toBe('My Description')
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('root')
  })

  it('should parse frontmatter with multiple fields', () => {
    const content = `---
title: Test Post
author: John Doe
date: 2024-01-01
tags:
  - test
  - markdown
---
Content here`
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    expect(result.data).toBeDefined()
    expect(result.data.title).toBe('Test Post')
    expect(result.data.author).toBe('John Doe')
    expect(result.data.date).toBe('2024-01-01')
    expect(Array.isArray(result.data.tags)).toBe(true)
    expect(result.data.tags).toEqual(['test', 'markdown'])
  })

  it('should handle content without frontmatter', () => {
    const content = '# No Frontmatter'
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    expect(result.data).toBeDefined()
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('root')
  })

  it('should parse empty frontmatter', () => {
    const content = `---
---
# Content`
    const result = parse(content) as ParseResult

    expect(result).toBeDefined()
    expect(result.data).toBeDefined()
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('root')
  })
})
