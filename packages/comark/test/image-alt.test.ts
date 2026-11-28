import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index.ts'

describe('image alt text', () => {
  it('extracts plain text from formatted alt content (#525 case 33)', async () => {
    const { nodes } = await parseMarkdown('![[x](u) *y*](a.png)')
    expect(nodes).toEqual([['p', {}, ['img', { src: 'a.png', alt: 'x y' }]]])
  })

  it('preserves inline code and nested image alt text', async () => {
    const { nodes } = await parseMarkdown('![a `b` ![c](d.png)](a.png)')
    expect(nodes).toEqual([['p', {}, ['img', { src: 'a.png', alt: 'a b c' }]]])
  })

  it('preserves empty alt attribute', async () => {
    const { nodes } = await parseMarkdown('![](a.png)')
    expect(nodes).toEqual([['p', {}, ['img', { src: 'a.png', alt: '' }]]])
  })
})
