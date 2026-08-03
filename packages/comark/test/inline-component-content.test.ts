import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index'

/**
 * The bracket content of `:name[…]` must consume nested `[…]` pairs — images,
 * links and nested components all contain `]` — instead of terminating at the
 * first `]` and spilling the remainder into the paragraph.
 */

describe('inline component bracket content', () => {
  it('parses an image inside a component', async () => {
    const result = await parseMarkdown('See :badge[![icon](i.png)] here')

    expect(result.nodes).toEqual([['p', {}, 'See ', ['badge', {}, ['img', { src: 'i.png', alt: 'icon' }]], ' here']])
  })

  it('parses a link inside a component', async () => {
    const result = await parseMarkdown('See :badge[[docs](https://x.dev)] here')

    expect(result.nodes).toEqual([['p', {}, 'See ', ['badge', {}, ['a', { href: 'https://x.dev' }, 'docs']], ' here']])
  })

  it('keeps escaped brackets literal', async () => {
    const result = await parseMarkdown('See :badge[\\[docs\\](x)] here')

    expect(result.nodes).toEqual([['p', {}, 'See ', ['badge', {}, '[docs](x)'], ' here']])
  })

  it('parses nested inline components', async () => {
    const result = await parseMarkdown('a :alert[:inner[:leaf]] b')

    expect(result.nodes).toEqual([['p', {}, 'a ', ['alert', {}, ['inner', {}, ['leaf', {}]]], ' b']])
  })

  it('parses an image in a block directive header', async () => {
    const result = await parseMarkdown('::card[![alt](i.png)]\n::')

    expect(result.nodes).toEqual([['card', {}, ['img', { src: 'i.png', alt: 'alt' }]]])
  })
})
