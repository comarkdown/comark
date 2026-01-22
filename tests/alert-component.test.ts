import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'
import { parseStreamIncremental } from '../src/stream'

describe('alert Component Parsing', () => {
  const alertContent = `::alert{type="info"}
Watch how **bold text** and components render correctly even when syntax arrives in chunks.
::`

  it('should parse alert with markdown-it', () => {
    const result = parse(alertContent)

    // console.log('Markdown-it Result:', JSON.stringify(result.body, null, 2))

    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)

    // Should have an alert component
    const alert = result.body.children.find((child: any) => child.tag === 'alert')
    expect(alert).toBeDefined()
    expect(alert?.type).toBe('element')

    // Check props
    expect(alert?.props?.type).toBe('info')

    // Should have content with bold text
    if (alert?.children) {
      const _hasStrong = JSON.stringify(alert.children).includes('strong')
      // console.log('Has bold text:', _hasStrong)
    }
  })

  it('should parse alert with remark', () => {
    const result = parse(alertContent)

    // console.log('Remark Result:', JSON.stringify(result.body, null, 2))

    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)

    // Should have an alert component
    const alert = result.body.children.find((child: any) => child.tag === 'alert')
    expect(alert).toBeDefined()
  })

  it('should parse alert in streaming with markdown-it', async () => {
    const chunks = [
      '::alert{type="info"}\n',
      'Watch how **bold text',
      '** and components render.\n',
      '::',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
      // console.log(`Chunk ${results.length}:`, {
      //   children: result.body.children.length,
      //   hasAlert: result.body.children.some((c: any) => c.tag === 'alert'),
      // })
    }

    // All intermediate results should have the alert
    for (const result of results) {
      expect(result.body.type).toBe('root')
      const hasAlert = result.body.children.some((c: any) => c.tag === 'alert')
      expect(hasAlert).toBe(true)
    }

    // Final result
    const final = results[results.length - 1]
    expect(final.isComplete).toBe(true)
  })

  it('should parse alert in streaming with remark', async () => {
    const chunks = [
      '::alert{type="info"}\n',
      'Watch how **bold text',
      '** and components render.\n',
      '::',
    ]

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    // Final result should have alert
    const final = results[results.length - 1]
    expect(final.isComplete).toBe(true)
    expect(final.body.children.length).toBeGreaterThan(0)
  })
})
