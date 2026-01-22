import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { parseStream } from '../src/stream'

describe('stream Examples', () => {
  it('example 1: Simple streaming with Node.js Readable', async () => {
    const content = `---
title: My Document
author: John Doe
---

# Welcome

This is a **sample** document with *emphasis*.

## Features

- Item 1
- Item 2
- Item 3
`

    const stream = Readable.from([content])
    const result = await parseStream(stream)

    expect(result.data).toEqual({
      title: 'My Document',
      author: 'John Doe',
    })
    expect(result.body.children.length).toBeGreaterThan(0)
    expect(result.body.children[0].type).toBe('element')
    expect(result.body.children[0].tag).toBe('h1')
  })

  it('example 2: Chunked streaming', async () => {
    const chunks = [
      '# Hello ',
      'World\n\n',
      'This is a ',
      'test with ',
      '**bold** text.',
    ]

    const stream = Readable.from(chunks)
    const result = await parseStream(stream)

    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)
  })

  it('example 3: Web ReadableStream', async () => {
    const content = '# MDC Component\n\n::alert{type="info"}\nThis is an alert component\n::'
    const encoder = new TextEncoder()

    const webStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(content))
        controller.close()
      },
    })

    const result = await parseStream(webStream)

    expect(result.body.children[0].tag).toBe('h1')
    expect(result.body.children[1]?.tag).toBe('alert')
  })

  it('example 4: Comparing both parsers', async () => {
    const content = `# Test Document

This is a paragraph with inline \`code\`.

\`\`\`javascript
const x = 1;
\`\`\`
`

    const stream1 = Readable.from([content])
    const stream2 = Readable.from([content])

    const result1 = await parseStream(stream1)
    const result2 = await parseStream(stream2)

    expect(result1.body.type).toBe(result2.body.type)
    expect(result1.body.children.length).toBe(result2.body.children.length)
  })

  it('example 5: Error handling - successful parse', async () => {
    const content = '# Valid Content\n\nSome text here.'
    const stream = Readable.from([content])

    const result = await parseStream(stream)
    expect(result.body.children.length).toBeGreaterThan(0)
  })

  it('example 6: Empty content', async () => {
    const emptyStream = Readable.from([''])
    const emptyResult = await parseStream(emptyStream)
    expect(emptyResult.body.children.length).toBe(0)
  })

  it('example 6: Whitespace only content', async () => {
    const whitespaceStream = Readable.from(['   \n\n\t  '])
    const whitespaceResult = await parseStream(whitespaceStream)
    expect(whitespaceResult.body.children.length).toBe(0)
  })

  it('example 6: Just frontmatter', async () => {
    const frontmatterStream = Readable.from(['---\ntitle: Test\n---\n'])
    const frontmatterResult = await parseStream(frontmatterStream)
    expect(frontmatterResult.data).toEqual({ title: 'Test' })
    expect(frontmatterResult.body.children.length).toBe(0)
  })
})
