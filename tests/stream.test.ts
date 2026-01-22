import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { parseStream } from '../src/stream'

describe('stream parsing', () => {
  describe('parseStream with Node.js Readable', () => {
    it('should parse simple markdown from stream', async () => {
      const content = '# Hello World\n\nThis is a paragraph.'
      const stream = Readable.from([content])

      const result = await parseStream(stream)

      expect(result.body).toBeDefined()
      expect(result.body.type).toBe('root')
      expect(result.body.children).toHaveLength(2)
      expect(result.body.children[0].type).toBe('element')
      expect(result.body.children[0].tag).toBe('h1')
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
      expect(result.body.children[0].tag).toBe('h1')
    })

    it('should handle chunked streams', async () => {
      const chunks = ['# Hello', ' World\n\n', 'This is ', 'a paragraph.']
      const stream = Readable.from(chunks)

      const result = await parseStream(stream)

      expect(result.body.type).toBe('root')
      expect(result.body.children).toHaveLength(2)
    })

    it('should handle empty streams', async () => {
      const stream = Readable.from([''])

      const result = await parseStream(stream)

      expect(result.body.type).toBe('root')
      expect(result.body.children).toHaveLength(0)
    })

    it('should parse MDC components from stream', async () => {
      const content = '::alert{type="info"}\nThis is an alert\n::'
      const stream = Readable.from([content])

      const result = await parseStream(stream)

      expect(result.body.children).toHaveLength(1)
      expect(result.body.children[0].type).toBe('element')
      expect(result.body.children[0].tag).toBe('alert')
    })
  })

  describe('parseStream with Node.js Readable', () => {
    it('should parse simple markdown from stream', async () => {
      const content = '# Hello World\n\nThis is a paragraph.'
      const stream = Readable.from([content])

      const result = await parseStream(stream)

      expect(result.body).toBeDefined()
      expect(result.body.type).toBe('root')
      expect(result.body.children).toHaveLength(2)
      expect(result.body.children[0].type).toBe('element')
      expect(result.body.children[0].tag).toBe('h1')
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
      expect(result.body.children[0].tag).toBe('h1')
    })

    it('should handle chunked streams', async () => {
      const chunks = ['# Hello', ' World\n\n', 'This is ', 'a paragraph.']
      const stream = Readable.from(chunks)

      const result = await parseStream(stream)

      expect(result.body.type).toBe('root')
      expect(result.body.children).toHaveLength(2)
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
      expect(result.body.type).toBe('root')
      expect(result.body.children).toHaveLength(2)
      expect(result.body.children[0].type).toBe('element')
      expect(result.body.children[0].tag).toBe('h1')
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
      expect(result.body.children[0].tag).toBe('h1')
    })

    it('should handle chunked web streams', async () => {
      const chunks = ['# Hello', ' World\n\n', 'This is ', 'a paragraph.']
      const stream = createChunkedWebStream(chunks)

      const result = await parseStream(stream)

      expect(result.body.type).toBe('root')
      expect(result.body.children).toHaveLength(2)
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

    it('should parse simple markdown from web stream', async () => {
      const content = '# Hello World\n\nThis is a paragraph.'
      const stream = createWebStream(content)

      const result = await parseStream(stream)

      expect(result.body).toBeDefined()
      expect(result.body.type).toBe('root')
      expect(result.body.children).toHaveLength(2)
      expect(result.body.children[0].type).toBe('element')
      expect(result.body.children[0].tag).toBe('h1')
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
      expect(result.body.children[0].tag).toBe('h1')
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
      expect(result1.body.children.length).toBe(result2.body.children.length)
    })
  })
})
