import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { parseStreamIncremental } from '../src/stream'

describe('incremental Stream Parsing', () => {
  describe('parseStreamIncremental', () => {
    it('should yield results for each chunk', async () => {
      const chunks = ['# Hello', ' World\n\n', 'Paragraph text']
      const stream = Readable.from(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      // We should get one result per chunk + 1 final result
      expect(results.length).toBe(chunks.length + 1)

      // Check each intermediate result
      for (let i = 0; i < chunks.length; i++) {
        expect(results[i].chunk).toBe(chunks[i])
        expect(results[i].isComplete).toBe(false)
        expect(results[i].body.type).toBe('comark')
      }

      // Check final result
      const finalResult = results[results.length - 1]
      expect(finalResult.isComplete).toBe(true)
      expect(finalResult.chunk).toBe('')
      expect(finalResult.toc).toBeDefined()
    })

    it('should parse frontmatter in first chunks', async () => {
      const chunks = [
        '---\n',
        'title: Test\n',
        'author: John\n',
        '---\n',
        '# Content',
      ]
      const stream = Readable.from(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)

        // Once we've received the frontmatter, data should be available
        if (result.chunk.includes('---\n# Content') || result.isComplete) {
          expect(result.data).toBeDefined()
        }
      }

      const finalResult = results[results.length - 1]
      expect(finalResult.data).toEqual({
        title: 'Test',
        author: 'John',
      })
    })

    it('should build up content progressively', async () => {
      const chunks = ['# Heading\n\n', 'First para.\n\n', 'Second para.']
      const stream = Readable.from(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      // First chunk should have heading
      expect(results[0].body.value.length).toBeGreaterThan(0)
      expect(results[0].body.value[0][0]).toBe('h1')

      // Second chunk should have heading + first paragraph
      expect(results[1].body.value.length).toBeGreaterThan(1)

      // Third chunk should have heading + both paragraphs
      expect(results[2].body.value.length).toBeGreaterThan(2)

      // Final result should be complete
      const finalResult = results[results.length - 1]
      expect(finalResult.isComplete).toBe(true)
    })

    it('should handle empty chunks gracefully', async () => {
      const chunks = ['# Title', '', '\n\n', 'Content']
      const stream = Readable.from(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      expect(results.length).toBeGreaterThan(0)
      const finalResult = results[results.length - 1]
      expect(finalResult.isComplete).toBe(true)
    })

    it('should handle single chunk stream', async () => {
      const content = '# Hello\n\nWorld'
      const stream = Readable.from([content])

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      // Should have 1 intermediate + 1 final
      expect(results.length).toBe(2)
      expect(results[0].chunk).toBe(content)
      expect(results[0].isComplete).toBe(false)
      expect(results[1].isComplete).toBe(true)
    })

    it('should handle Comark components progressively', async () => {
      const chunks = [
        '::alert{type="info"}\n',
        'This is an alert\n',
        '::',
      ]
      const stream = Readable.from(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      const finalResult = results[results.length - 1]
      expect(finalResult.isComplete).toBe(true)
      expect(finalResult.body.value.length).toBeGreaterThan(0)
      expect(finalResult.body.value[0][0]).toBe('alert')
    })
  })

  describe('parseStreamIncremental', () => {
    it('should yield results for each chunk', async () => {
      const chunks = ['# Hello', ' World\n\n', 'Paragraph text']
      const stream = Readable.from(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      // We should get one result per chunk + 1 final result
      expect(results.length).toBe(chunks.length + 1)

      // Check each intermediate result
      for (let i = 0; i < chunks.length; i++) {
        expect(results[i].chunk).toBe(chunks[i])
        expect(results[i].isComplete).toBe(false)
        expect(results[i].body.type).toBe('comark')
      }

      // Check final result
      const finalResult = results[results.length - 1]
      expect(finalResult.isComplete).toBe(true)
      expect(finalResult.toc).toBeDefined()
    })

    it('should parse frontmatter progressively', async () => {
      const chunks = [
        '---\ntitle: Test\n---\n',
        '# Content',
      ]
      const stream = Readable.from(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      const finalResult = results[results.length - 1]
      expect(finalResult.data.title).toBe('Test')
    })

    it('should build up content progressively', async () => {
      const chunks = ['# Heading\n\n', 'First para.\n\n', 'Second para.']
      const stream = Readable.from(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      // Content should grow with each chunk
      expect(results[0].body.value.length).toBeGreaterThan(0)
      expect(results[1].body.value.length).toBeGreaterThan(0)
      expect(results[2].body.value.length).toBeGreaterThan(0)

      // Final result should be complete
      const finalResult = results[results.length - 1]
      expect(finalResult.isComplete).toBe(true)
    })
  })

  describe('parseStreamIncremental with Web ReadableStream', () => {
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

    it('should handle Web ReadableStream', async () => {
      const chunks = ['# Hello', ' World\n\n', 'Content']
      const stream = createChunkedWebStream(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      expect(results.length).toBe(chunks.length + 1)

      const finalResult = results[results.length - 1]
      expect(finalResult.isComplete).toBe(true)
    })

    it('should parse Web stream with frontmatter', async () => {
      const chunks = [
        '---\ntitle: Web Test\n---\n',
        '# Heading\n\n',
        'Content',
      ]
      const stream = createChunkedWebStream(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      const finalResult = results[results.length - 1]
      expect(finalResult.data.title).toBe('Web Test')
      expect(finalResult.isComplete).toBe(true)
    })
  })

  describe('parseStreamIncremental with Web ReadableStream', () => {
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

    it('should handle Web ReadableStream', async () => {
      const chunks = ['# Title\n\n', 'Paragraph 1\n\n', 'Paragraph 2']
      const stream = createChunkedWebStream(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      expect(results.length).toBe(chunks.length + 1)

      const finalResult = results[results.length - 1]
      expect(finalResult.isComplete).toBe(true)
      expect(finalResult.body.value.length).toBeGreaterThan(0)
    })
  })

  describe('real-world scenarios', () => {
    it('should handle large document in chunks', async () => {
      const chunks = [
        '---\ntitle: Large Doc\n---\n',
        '# Introduction\n\n',
        'This is the intro.\n\n',
        '## Section 1\n\n',
        'Content for section 1.\n\n',
        '## Section 2\n\n',
        'Content for section 2.',
      ]
      const stream = Readable.from(chunks)

      let chunkCount = 0
      let lastChildrenCount = 0

      for await (const result of parseStreamIncremental(stream)) {
        chunkCount++

        // Body should exist and have type root
        expect(result.body.type).toBe('comark')

        // Children count should only grow or stay the same
        expect(result.body.value.length).toBeGreaterThanOrEqual(lastChildrenCount)
        lastChildrenCount = result.body.value.length

        if (result.isComplete) {
          // Final result should have all sections
          expect(result.body.value.length).toBeGreaterThan(3)
          expect(result.data.title).toBe('Large Doc')
          expect(result.toc).toBeDefined()
        }
      }

      expect(chunkCount).toBe(chunks.length + 1)
    })

    it('should handle streaming with code blocks', async () => {
      const chunks = [
        '# Code Example\n\n',
        '```javascript\n',
        'const x = 1;\n',
        'const y = 2;\n',
        '```',
      ]
      const stream = Readable.from(chunks)

      const results = []
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)
      }

      const finalResult = results[results.length - 1]
      expect(finalResult.isComplete).toBe(true)
      expect(finalResult.body.value.length).toBeGreaterThan(0)
    })

    it('should provide intermediate updates for UI rendering', async () => {
      const chunks = [
        '# Title\n\n',
        'First paragraph.\n\n',
        'Second paragraph.\n\n',
        'Third paragraph.',
      ]
      const stream = Readable.from(chunks)

      const intermediateStates = []

      for await (const result of parseStreamIncremental(stream)) {
        if (!result.isComplete) {
          intermediateStates.push({
            childrenCount: result.body.value.length,
            chunk: result.chunk,
          })
        }
      }

      // Should have intermediate states for each chunk
      expect(intermediateStates.length).toBe(chunks.length)

      // Each state should have progressively more or equal children
      for (let i = 1; i < intermediateStates.length; i++) {
        expect(intermediateStates[i].childrenCount)
          .toBeGreaterThanOrEqual(intermediateStates[i - 1].childrenCount)
      }
    })
  })
})
