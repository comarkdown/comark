import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { parseStream } from '../src/stream'
import type { ComarkNode } from 'comark/ast'

// Helper to get tag from a ComarkNode
function getTag(node: ComarkNode): string | null {
  if (Array.isArray(node) && node.length >= 1) {
    return node[0] as string
  }
  return null
}

describe('stream parsing', () => {
  describe('parseStream with Node.js Readable', () => {
    it('should parse simple markdown from stream', async () => {
      const content = '# Hello World\n\nThis is a paragraph.'
      const stream = Readable.from([content])

      const result = await parseStream(stream)

      expect(result.body).toBeDefined()
      expect(result.body.type).toBe('comark')
      expect(result.body.value).toHaveLength(2)
      expect(Array.isArray(result.body.value[0])).toBe(true)
      expect(getTag(result.body.value[0])).toBe('h1')
    })

    it('should parse content with frontmatter from stream', async () => {
      const content = `---
title: Test Title
author: John Doe
---
# Content

This is the body.`
      const stream = Readable.from([content])

      const result = await parseStream(stream)

      expect(result.data).toEqual({
        title: 'Test Title',
        author: 'John Doe',
      })
      expect(getTag(result.body.value[0])).toBe('h1')
    })

    it('should handle chunked streams', async () => {
      const chunks = ['# Hello', ' World\n\n', 'This is ', 'a paragraph.']
      const stream = Readable.from(chunks)

      const result = await parseStream(stream)

      expect(result.body.type).toBe('comark')
      expect(result.body.value).toHaveLength(2)
    })

    it('should handle empty streams', async () => {
      const stream = Readable.from([''])

      const result = await parseStream(stream)

      expect(result.body.type).toBe('comark')
      expect(result.body.value).toHaveLength(0)
    })

    it('should parse Comark components from stream', async () => {
      const content = '::alert{type="info"}\nThis is an alert\n::'
      const stream = Readable.from([content])

      const result = await parseStream(stream)

      expect(result.body.value).toHaveLength(1)
      expect(Array.isArray(result.body.value[0])).toBe(true)
      expect(getTag(result.body.value[0])).toBe('alert')
    })
  })

  describe('parseStream with Node.js Readable (duplicate)', () => {
    it('should parse simple markdown from stream', async () => {
      const content = '# Hello World\n\nThis is a paragraph.'
      const stream = Readable.from([content])

      const result = await parseStream(stream)

      expect(result.body).toBeDefined()
      expect(result.body.type).toBe('comark')
      expect(result.body.value).toHaveLength(2)
      expect(Array.isArray(result.body.value[0])).toBe(true)
      expect(getTag(result.body.value[0])).toBe('h1')
    })

    it('should parse content with frontmatter from stream', async () => {
      const content = `---
title: Test Title
author: John Doe
---
# Content

This is the body.`
      const stream = Readable.from([content])

      const result = await parseStream(stream)

      expect(result.data).toEqual({
        title: 'Test Title',
        author: 'John Doe',
      })
      expect(getTag(result.body.value[0])).toBe('h1')
    })

    it('should handle chunked streams', async () => {
      const chunks = ['# Hello', ' World\n\n', 'This is ', 'a paragraph.']
      const stream = Readable.from(chunks)

      const result = await parseStream(stream)

      expect(result.body.type).toBe('comark')
      expect(result.body.value).toHaveLength(2)
    })
  })

  describe('parseStream with Web ReadableStream', () => {
    function createWebStream(content: string): ReadableStream<Uint8Array> {
      const encoder = new TextEncoder()
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(content))
          controller.close()
        },
      })
    }

    function createChunkedWebStream(chunks: string[]): ReadableStream<Uint8Array> {
      const encoder = new TextEncoder()
      let index = 0

      return new ReadableStream({
        pull(controller) {
          if (index < chunks.length) {
            controller.enqueue(encoder.encode(chunks[index]))
            index++
          }
          else {
            controller.close()
          }
        },
      })
    }

    it('should parse simple markdown from web stream', async () => {
      const content = '# Hello World\n\nThis is a paragraph.'
      const stream = createWebStream(content)

      const result = await parseStream(stream)

      expect(result.body).toBeDefined()
      expect(result.body.type).toBe('comark')
      expect(result.body.value).toHaveLength(2)
      expect(Array.isArray(result.body.value[0])).toBe(true)
      expect(getTag(result.body.value[0])).toBe('h1')
    })

    it('should parse content with frontmatter from web stream', async () => {
      const content = `---
title: Test Title
---
# Content`
      const stream = createWebStream(content)

      const result = await parseStream(stream)

      expect(result.data).toEqual({
        title: 'Test Title',
      })
      expect(getTag(result.body.value[0])).toBe('h1')
    })

    it('should handle chunked web streams', async () => {
      const chunks = ['# Hello', ' World\n\n', 'This is ', 'a paragraph.']
      const stream = createChunkedWebStream(chunks)

      const result = await parseStream(stream)

      expect(result.body.type).toBe('comark')
      expect(result.body.value).toHaveLength(2)
    })
  })

  describe('parseStream with Web ReadableStream (duplicate)', () => {
    function createWebStream(content: string): ReadableStream<Uint8Array> {
      const encoder = new TextEncoder()
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(content))
          controller.close()
        },
      })
    }

    it('should parse simple markdown from web stream', async () => {
      const content = '# Hello World\n\nThis is a paragraph.'
      const stream = createWebStream(content)

      const result = await parseStream(stream)

      expect(result.body).toBeDefined()
      expect(result.body.type).toBe('comark')
      expect(result.body.value).toHaveLength(2)
      expect(Array.isArray(result.body.value[0])).toBe(true)
      expect(getTag(result.body.value[0])).toBe('h1')
    })

    it('should parse content with frontmatter from web stream', async () => {
      const content = `---
title: Test Title
---
# Content`
      const stream = createWebStream(content)

      const result = await parseStream(stream)

      expect(result.data).toEqual({
        title: 'Test Title',
      })
      expect(getTag(result.body.value[0])).toBe('h1')
    })
  })

  describe('comparison between parseStream and parseStream', () => {
    it('should produce similar results for the same content', async () => {
      const content = `# Test Document

This is a **test** document with *emphasis*.

- Item 1
- Item 2

\`\`\`javascript
const x = 1;
\`\`\``

      const stream1 = Readable.from([content])
      const stream2 = Readable.from([content])

      const result1 = await parseStream(stream1)
      const result2 = await parseStream(stream2)

      expect(result1.body.type).toBe(result2.body.type)
      expect(result1.body.value.length).toBe(result2.body.value.length)
    })
  })
})
