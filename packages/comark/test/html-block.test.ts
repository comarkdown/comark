import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

describe('block-level raw HTML', () => {
  it('preserves inline children inside a self-contained block-level <p>', async () => {
    const result = await parse('<p><img src="/foo.png" alt="x"></p>')

    expect(result.nodes).toEqual([
      ['p', { $: { html: 1, block: 1 } }, ['img', { $: { html: 1, block: 1 }, src: '/foo.png', alt: 'x' }]],
    ])
  })

  it('preserves mixed text and inline children inside a single-line block-level <p>', async () => {
    const result = await parse('<p>hello <img src="/foo.png" alt="x"> world</p>')

    expect(result.nodes).toEqual([
      [
        'p',
        { $: { html: 1, block: 1 } },
        'hello',
        ['img', { $: { html: 1, block: 1 }, src: '/foo.png', alt: 'x' }],
        'world',
      ],
    ])
  })

  it('does not merge the following markdown paragraph into the preceding block-level <p>', async () => {
    const md = `# Hello

<p><img src="/foo.png" alt="x"></p>

That is some text here.`

    const result = await parse(md)

    expect(result.nodes).toEqual([
      ['h1', { id: 'hello' }, 'Hello'],
      ['p', { $: { html: 1, block: 1 } }, ['img', { $: { html: 1, block: 1 }, src: '/foo.png', alt: 'x' }]],
      ['p', {}, 'That is some text here.'],
    ])
  })

  it('preserves text inside a single-line block-level <div>', async () => {
    const result = await parse('<div>foo</div>')

    expect(result.nodes).toEqual([['div', { $: { html: 1, block: 1 } }, 'foo']])
  })
})
