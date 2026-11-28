import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index.ts'

describe('large paragraph children', () => {
  it('parses a paragraph with 65536 linkified children without RangeError (#525 case 31)', async () => {
    const { nodes } = await parseMarkdown('https://x.com/a '.repeat(65536))
    expect(nodes.length).toBe(1)
    expect((nodes[0] as any)[0]).toBe('p')
  })
})
