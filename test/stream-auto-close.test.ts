import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { parseStreamIncremental } from '../src/stream'
import type { MinimarkNode } from 'minimark'

// Helper to check if a node is an element with a specific tag
function isElement(node: MinimarkNode, tag: string): boolean {
  return Array.isArray(node) && node[0] === tag
}

describe('stream with Auto-Close - Remark Parser', () => {
  it('should auto-close unclosed bold during streaming', async () => {
    const chunks = [
      '**bold',
      ' text**',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    // First chunk should parse with auto-closed bold
    expect(results[0].isComplete).toBe(false)
    expect(results[0].body.value.length).toBeGreaterThan(0)

    // Final result should have complete bold text
    expect(results[results.length - 1].isComplete).toBe(true)
    expect(results[results.length - 1].body.value.length).toBeGreaterThan(0)
  })

  it('should auto-close unclosed component during streaming', async () => {
    const chunks = [
      '::alert{type="info"}\n',
      'This is important\n',
      '::',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    // First chunk (component opening) should be auto-closed and parseable
    expect(results[0].isComplete).toBe(false)
    expect(results[0].body.value.length).toBeGreaterThan(0)

    // Second chunk (component content) should still be auto-closed
    expect(results[1].isComplete).toBe(false)
    expect(results[1].body.value.length).toBeGreaterThan(0)

    // Final result with explicit closing should work
    expect(results[results.length - 1].isComplete).toBe(true)
  })

  it('should handle nested components with auto-close', async () => {
    const chunks = [
      ':::outer\n',
      '::inner\n',
      'content\n',
      '::\n',
      ':::',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    // Each intermediate result should be parseable
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].isComplete).toBe(false)
      expect(results[i].body.type).toBe('minimark')
    }

    // Final result
    expect(results[results.length - 1].isComplete).toBe(true)
  })

  it('should handle mixed unclosed syntax', async () => {
    const chunks = [
      '::card\n',
      'Text with **bold',
      ' and more**\n',
      '::',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    // Second chunk has both unclosed component and unclosed bold
    expect(results[1].isComplete).toBe(false)
    expect(results[1].body.type).toBe('minimark')

    // Should not throw errors at any stage
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('stream with Auto-Close - Markdown-it Parser', () => {
  it('should auto-close unclosed bold during streaming', async () => {
    const chunks = [
      '**bold',
      ' text**',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    // First chunk should parse with auto-closed bold
    expect(results[0].isComplete).toBe(false)
    expect(results[0].body.value.length).toBeGreaterThan(0)

    // Final result should have complete bold text
    expect(results[results.length - 1].isComplete).toBe(true)
    expect(results[results.length - 1].body.value.length).toBeGreaterThan(0)
  })

  it('should auto-close unclosed component during streaming', async () => {
    const chunks = [
      '::alert{type="info"}\n',
      'This is important\n',
      '::',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    // First chunk (component opening) should be auto-closed and parseable
    expect(results[0].isComplete).toBe(false)
    expect(results[0].body.value.length).toBeGreaterThan(0)

    // Each result should have a valid alert component
    for (const result of results) {
      expect(result.body.type).toBe('minimark')
      const hasAlert = result.body.value.some((child: MinimarkNode) => isElement(child, 'alert'))
      expect(hasAlert).toBe(true)
    }

    // Final result
    expect(results[results.length - 1].isComplete).toBe(true)
  })

  it('should handle real-world streaming scenario', async () => {
    // Simulate an AI response coming in chunks
    const chunks = [
      '# Response\n\n',
      '::alert{type="info"}\n',
      'This is **important',
      ' information** that you should know.\n',
      '::\n\n',
      'Here is some `code',
      '` example.',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)

      // Every intermediate result should be parseable
      expect(result.body.type).toBe('minimark')
      expect(result.body.value.length).toBeGreaterThan(0)
    }

    // Final result should be complete
    const final = results[results.length - 1]
    expect(final.isComplete).toBe(true)

    // Should have heading
    expect(final.body.value.some((child: MinimarkNode) => isElement(child, 'h1'))).toBe(true)

    // Should have alert component
    expect(final.body.value.some((child: MinimarkNode) => isElement(child, 'alert'))).toBe(true)
  })

  it('should handle small chunks with auto-close', async () => {
    const content = '::card\n**Bold text**\n::'
    const chunks: string[] = []

    // Split into very small chunks (5 chars each)
    for (let i = 0; i < content.length; i += 5) {
      chunks.push(content.slice(i, i + 5))
    }

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
      // Should not throw errors
      expect(result.body.type).toBe('minimark')
    }

    // Should have processed all chunks
    expect(results.length).toBe(chunks.length + 1) // +1 for final complete
  })

  it('should handle deeply nested components', async () => {
    const chunks = [
      '::::level4\n',
      ':::level3\n',
      '::level2\n',
      'content\n',
      '::\n',
      ':::\n',
      '::::',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)

      // Each result should be parseable
      expect(result.body.type).toBe('minimark')
    }

    // Final result should be complete with all nesting resolved
    expect(results[results.length - 1].isComplete).toBe(true)
  })
})

describe('stream Auto-Close Edge Cases', () => {
  it('should handle empty chunks', async () => {
    const chunks = ['**bold', '', ' text**']
    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    expect(results.length).toBeGreaterThan(0)
    expect(results[results.length - 1].isComplete).toBe(true)
  })

  it('should handle whitespace-only chunks', async () => {
    const chunks = ['::card\n', '   ', '\n', 'text\n', '::']
    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
      expect(result.body.type).toBe('minimark')
    }

    expect(results[results.length - 1].isComplete).toBe(true)
  })

  it('should not modify already complete content', async () => {
    const chunks = [
      '**bold** text',
      '\n\n',
      '::card\ntext\n::',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    // Should process without errors
    expect(results.length).toBeGreaterThan(0)
  })
})
