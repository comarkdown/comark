import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index'
import html from '../src/plugins/html'

const sponsorsUrl = 'https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'

describe('html({ markdown })', () => {
  it('parses markdown inside incomplete HTML by default', async () => {
    const result = await parseMarkdown('<ai-thinking>\n**bold**')

    expect(result.nodes).toEqual([
      ['ai-thinking', { $: { html: 1, block: 0 } }, ['strong', {}, 'bold']],
    ])
  })

  it('keeps markdown literal inside incomplete HTML when markdown: false', async () => {
    const result = await parseMarkdown('<ai-thinking>\n**bold**', {
      // Replace the default html plugin so only this config is active.
      plugins: [html({ markdown: false })],
    })

    // Body is a single text leaf → block: 0 (inline-like incomplete opener).
    expect(result.nodes).toEqual([['ai-thinking', { $: { html: 1, block: 0 } }, '**bold**']])
  })

  it('still parses markdown after a blank line when markdown: false', async () => {
    const result = await parseMarkdown('<ai-thinking>\n\n**bold**\n\n', {
      plugins: [html({ markdown: false })],
    })

    expect(result.nodes).toEqual([
      ['ai-thinking', { $: { html: 1, block: 0 } }, ['strong', {}, 'bold']],
    ])
  })

  it('still keeps closed HTML body literal without a blank line when markdown: false', async () => {
    const result = await parseMarkdown('<div>\nHello **World**\n</div>', {
      plugins: [html({ markdown: false })],
    })

    expect(result.nodes).toEqual([['div', { $: { html: 1, block: 1 } }, 'Hello **World**']])
  })

  it('parses markdown inside closed HTML after a blank line when markdown: false', async () => {
    const result = await parseMarkdown('<div>\n\nHello **World**\n\n</div>', {
      plugins: [html({ markdown: false })],
    })

    expect(result.nodes).toEqual([
      ['div', { $: { html: 1, block: 1 } }, 'Hello ', ['strong', {}, 'World']],
    ])
  })
})

describe('block-level raw HTML', () => {
  it('preserves inline children inside a self-contained block-level <p>', async () => {
    const result = await parseMarkdown('<p><img src="/foo.png" alt="x"></p>')

    expect(result.nodes).toEqual([
      ['p', { $: { html: 1, block: 1 } }, ['img', { $: { html: 1, block: 0 }, src: '/foo.png', alt: 'x' }]],
    ])
  })

  it('preserves mixed text and inline children inside a single-line block-level <p>', async () => {
    const result = await parseMarkdown('<p>hello <img src="/foo.png" alt="x"> world</p>')

    expect(result.nodes).toEqual([
      [
        'p',
        { $: { html: 1, block: 1 } },
        'hello',
        ['img', { $: { html: 1, block: 0 }, src: '/foo.png', alt: 'x' }],
        'world',
      ],
    ])
  })

  it('does not merge the following markdown paragraph into the preceding block-level <p>', async () => {
    const md = `# Hello

<p><img src="/foo.png" alt="x"></p>

That is some text here.`

    const result = await parseMarkdown(md)

    expect(result.nodes).toEqual([
      ['h1', { id: 'hello' }, 'Hello'],
      ['p', { $: { html: 1, block: 1 } }, ['img', { $: { html: 1, block: 0 }, src: '/foo.png', alt: 'x' }]],
      ['p', {}, 'That is some text here.'],
    ])
  })

  it('preserves text inside a single-line block-level <div>', async () => {
    const result = await parseMarkdown('<div>foo</div>')

    expect(result.nodes).toEqual([['div', { $: { html: 1, block: 1 } }, 'foo']])
  })

  it('preserves text inside a multiline raw HTML <p> verbatim — no markdown re-parsing', async () => {
    const result = await parseMarkdown(`<p>
  this is **markdown**
</p>`)

    expect(result.nodes).toEqual([['p', { $: { html: 1, block: 1 } }, 'this is **markdown**']])
  })

  it('nests blank-line markdown body under a matching HTML open/close pair', async () => {
    const result = await parseMarkdown(`<p>

this is **markdown**

</p>`)

    expect(result.nodes).toEqual([['p', { $: { html: 1, block: 1 } }, 'this is ', ['strong', {}, 'markdown']]])
  })

  it('preserves mixed text and raw HTML children verbatim inside a multiline raw HTML block', async () => {
    const result = await parseMarkdown(`<div>
  before **strong**
  <img src="/x.png" alt="x"/>
  after \`code\`
</div>`)

    expect(result.nodes).toEqual([
      [
        'div',
        { $: { html: 1, block: 1 } },
        'before **strong**',
        ['img', { $: { html: 1, block: 0 }, src: '/x.png', alt: 'x' }],
        'after `code`',
      ],
    ])
  })

  it('nests blank-line markdown and HTML under a matching open/close pair', async () => {
    const result = await parseMarkdown(`<div>

before **strong**

<img src="/x.png" alt="x"/>

after \`code\`

</div>`)

    expect(result.nodes).toEqual([
      [
        'div',
        { $: { html: 1, block: 1 } },
        ['p', {}, 'before ', ['strong', {}, 'strong']],
        ['img', { $: { html: 1, block: 1 }, src: '/x.png', alt: 'x' }],
        ['p', {}, 'after ', ['code', {}, 'code']],
      ],
    ])
  })

  it('keeps indented non-HTML content inside a multiline raw HTML block as raw text', async () => {
    const result = await parseMarkdown(`<div>
    const value = 1
</div>`)

    expect(result.nodes).toEqual([['div', { $: { html: 1, block: 1 } }, 'const value = 1']])
  })

  it('preserves HTML comments inside a multiline raw HTML block', async () => {
    const result = await parseMarkdown(`<div>
  <!-- note -->
  <img src="/x.png"/>
</div>`)

    expect(result.nodes).toEqual([
      ['div', { $: { html: 1, block: 1 } }, [null, {}, ' note '], ['img', { $: { html: 1, block: 0 }, src: '/x.png' }]],
    ])
  })

  it('preserves nested indented raw HTML children inside a multiline <a>', async () => {
    const result = await parseMarkdown(`<a href="${sponsorsUrl}">
  <img src="${sponsorsUrl}" alt="Sponsors"/>
</a>`)

    expect(result.nodes).toEqual([
      [
        'a',
        { $: { html: 1, block: 1 }, href: sponsorsUrl },
        ['img', { $: { html: 1, block: 0 }, src: sponsorsUrl, alt: 'Sponsors' }],
      ],
    ])
  })

  it('preserves nested indented raw HTML children inside a wrapped multiline <p>', async () => {
    const result = await parseMarkdown(`<p align="center">
  <a href="${sponsorsUrl}">
    <img src="${sponsorsUrl}" alt="Sponsors"/>
  </a>
</p>`)

    expect(result.nodes).toEqual([
      [
        'p',
        { $: { html: 1, block: 1 }, align: 'center' },
        [
          'a',
          { $: { html: 1, block: 0 }, href: sponsorsUrl },
          ['img', { $: { html: 1, block: 0 }, src: sponsorsUrl, alt: 'Sponsors' }],
        ],
      ],
    ])
  })

  it('does not emit a stray empty component for multiline raw HTML closes', async () => {
    const result = await parseMarkdown(`<p align="center">
  <a href="${sponsorsUrl}">
    <img src="${sponsorsUrl}" alt="Sponsors"/>
  </a>
</p>`)

    expect(result.nodes).not.toContainEqual(['component', {}])
  })

  it('keeps real indented markdown code blocks outside raw HTML blocks', async () => {
    const result = await parseMarkdown('    <img src="/foo.png" alt="x"/>')

    expect(result.nodes).toEqual([['pre', {}, ['code', {}, '<img src="/foo.png" alt="x"/>']]])
  })

  it('keeps indented HTML comments outside raw HTML blocks as markdown code', async () => {
    const result = await parseMarkdown('    <!-- note -->')

    expect(result.nodes).toEqual([['pre', {}, ['code', {}, '<!-- note -->']]])
  })
})
