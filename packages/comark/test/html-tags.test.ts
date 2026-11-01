import { describe, expect, it } from 'vitest'
import { createMarkdownParser, parseMarkdown } from '../src/index'
import html from '../src/plugins/html'
import { renderMarkdown } from '../src/render'
import { renderHtmlForTest } from './utils/render-html'

const block = { html: 1, block: 1 }
const inline = { html: 1, block: 0 }

describe('HTML attributes', () => {
  it('keeps a JSX-style braced value on an open tag', async () => {
    const result = await parseMarkdown('<div style={{a: 1}}>x</div>')

    expect(result.nodes).toEqual([['div', { $: block, style: '{{a: 1}}' }, 'x']])
  })

  it('keeps a braced value with nested braces, quotes and spaces on an inline tag', async () => {
    const result = await parseMarkdown('a <b data={`x ${1}`} on={{ k: { v: 1 } }} d>y</b>')

    expect(result.nodes).toEqual([
      ['p', {}, 'a ', ['b', { $: inline, data: '{`x ${1}`}', on: '{{ k: { v: 1 } }}', d: true }, 'y']],
    ])
  })

  it('keeps the first of duplicate attributes', async () => {
    const result = await parseMarkdown('<img alt="first" alt="second">\n\n<a href=x HREF=y title>t</a>')

    expect(result.nodes).toEqual([
      ['img', { $: block, alt: 'first' }],
      ['a', { $: inline, href: 'x', title: true }, 't'],
    ])
  })

  it('keeps an attribute named like an Object.prototype member', async () => {
    const result = await parseMarkdown('<div constructor="a" constructor="b">x</div>')

    expect(result.nodes).toEqual([['div', { $: block, constructor: 'a' }, 'x']])
  })
})

describe('HTML comments', () => {
  it('reads <!--- … ---> as a comment inline and as a block', async () => {
    const result = await parseMarkdown('a <!--- b ---> c\n\n<!--- d --->')

    expect(result.nodes).toEqual([
      ['p', {}, 'a ', [null, {}, '- b -'], ' c'],
      [null, {}, '- d -'],
    ])
  })
})
