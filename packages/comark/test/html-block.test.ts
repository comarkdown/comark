import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

const sponsorsUrl = 'https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'

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

  it('preserves text inside a multiline raw HTML <p> verbatim — no markdown re-parsing', async () => {
    const result = await parse(`<p>
  this is **markdown**
</p>`)

    expect(result.nodes).toEqual([['p', { $: { html: 1, block: 1 } }, 'this is **markdown**']])
  })

  it('keeps markdown inside a type-6 HTML block across blank lines', async () => {
    const result = await parse(`<p>

this is **markdown**

</p>`)

    expect(result.nodes).toEqual([['p', { $: { html: 1, block: 1 } }, 'this is ', ['strong', {}, 'markdown']]])
  })

  it('preserves mixed text and raw HTML children verbatim inside a multiline raw HTML block', async () => {
    const result = await parse(`<div>
  before **strong**
  <img src="/x.png" alt="x"/>
  after \`code\`
</div>`)

    expect(result.nodes).toEqual([
      [
        'div',
        { $: { html: 1, block: 1 } },
        'before **strong**',
        ['img', { $: { html: 1, block: 1 }, src: '/x.png', alt: 'x' }],
        'after `code`',
      ],
    ])
  })

  it('keeps markdown and raw HTML inside a type-6 block across blank lines', async () => {
    const result = await parse(`<div>

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
    const result = await parse(`<div>
    const value = 1
</div>`)

    expect(result.nodes).toEqual([['div', { $: { html: 1, block: 1 } }, 'const value = 1']])
  })

  it('preserves HTML comments inside a multiline raw HTML block', async () => {
    const result = await parse(`<div>
  <!-- note -->
  <img src="/x.png"/>
</div>`)

    expect(result.nodes).toEqual([
      ['div', { $: { html: 1, block: 1 } }, [null, {}, ' note '], ['img', { $: { html: 1, block: 1 }, src: '/x.png' }]],
    ])
  })

  it('preserves nested indented raw HTML children inside a multiline <a>', async () => {
    const result = await parse(`<a href="${sponsorsUrl}">
  <img src="${sponsorsUrl}" alt="Sponsors"/>
</a>`)

    expect(result.nodes).toEqual([
      [
        'a',
        { $: { html: 1, block: 1 }, href: sponsorsUrl },
        ['img', { $: { html: 1, block: 1 }, src: sponsorsUrl, alt: 'Sponsors' }],
      ],
    ])
  })

  it('preserves nested indented raw HTML children inside a wrapped multiline <p>', async () => {
    const result = await parse(`<p align="center">
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
          { $: { html: 1, block: 1 }, href: sponsorsUrl },
          ['img', { $: { html: 1, block: 1 }, src: sponsorsUrl, alt: 'Sponsors' }],
        ],
      ],
    ])
  })

  it('does not emit a stray empty component for multiline raw HTML closes', async () => {
    const result = await parse(`<p align="center">
  <a href="${sponsorsUrl}">
    <img src="${sponsorsUrl}" alt="Sponsors"/>
  </a>
</p>`)

    expect(result.nodes).not.toContainEqual(['component', {}])
  })

  it('keeps real indented markdown code blocks outside raw HTML blocks', async () => {
    const result = await parse('    <img src="/foo.png" alt="x"/>')

    expect(result.nodes).toEqual([['pre', {}, ['code', {}, '<img src="/foo.png" alt="x"/>']]])
  })

  it('keeps indented HTML comments outside raw HTML blocks as markdown code', async () => {
    const result = await parse('    <!-- note -->')

    expect(result.nodes).toEqual([['pre', {}, ['code', {}, '<!-- note -->']]])
  })
})

describe('type-6 HTML block handling', () => {
  it('does not treat a void type-6 tag as a container', async () => {
    const result = await parse(`<hr>

after`)

    expect(result.nodes).toEqual([
      ['hr', { $: { html: 1, block: 1 } }],
      ['p', {}, 'after'],
    ])
  })

  it('does not let an unclosed type-6 block consume following Markdown', async () => {
    const result = await parse(`<div>

after`)

    expect(result.nodes).toEqual([
      ['div', { $: { html: 1, block: 1 } }],
      ['p', {}, 'after'],
    ])
  })

  it('keeps Markdown inside a div across blank lines', async () => {
    const md = `<div class="foo">

*Markdown*

</div>`

    const result = await parse(md)

    expect(result.nodes).toEqual([['div', { $: { html: 1, block: 1 }, class: 'foo' }, ['em', {}, 'Markdown']]])
  })

  it('handles nested type-6 blocks with different tags', async () => {
    const md = `<section>

<div>

content

</div>

</section>`

    const result = await parse(md)

    expect(result.nodes).toEqual([
      ['section', { $: { html: 1, block: 1 } }, ['div', { $: { html: 1, block: 1 } }, 'content']],
    ])
  })

  it('keeps content inside <details> when blank line separates summary from body', async () => {
    const md = `<details>
<summary>Title</summary>

xxx
</details>`

    const result = await parse(md)

    expect(result.nodes).toEqual([
      ['details', { $: { html: 1, block: 1 } }, ['summary', { $: { html: 1, block: 1 } }, 'Title'], ['p', {}, 'xxx']],
    ])
  })

  it('keeps multiple paragraphs inside <details>', async () => {
    const md = `<details>
<summary>Title</summary>

paragraph 1

paragraph 2
</details>`

    const result = await parse(md)

    expect(result.nodes).toEqual([
      [
        'details',
        { $: { html: 1, block: 1 } },
        ['summary', { $: { html: 1, block: 1 } }, 'Title'],
        ['p', {}, 'paragraph 1'],
        ['p', {}, 'paragraph 2'],
      ],
    ])
  })

  it('handles nested <details> blocks', async () => {
    const md = `<details>
<summary>Outer</summary>

<details>
<summary>Inner</summary>

inner content
</details>

outer content
</details>`

    const result = await parse(md)

    expect(result.nodes).toEqual([
      [
        'details',
        { $: { html: 1, block: 1 } },
        ['summary', { $: { html: 1, block: 1 } }, 'Outer'],
        [
          'details',
          { $: { html: 1, block: 1 } },
          ['summary', { $: { html: 1, block: 1 } }, 'Inner'],
          ['p', {}, 'inner content'],
        ],
        ['p', {}, 'outer content'],
      ],
    ])
  })

  it('handles <details> without blank line (self-contained HTML block)', async () => {
    const md = `<details>
<summary>Title</summary>
Content without blank line
</details>`

    const result = await parse(md)

    expect(result.nodes).toEqual([
      [
        'details',
        { $: { html: 1, block: 1 } },
        ['summary', { $: { html: 1, block: 1 } }, 'Title'],
        'Content without blank line',
      ],
    ])
  })

  it('handles <details open> with attributes', async () => {
    const md = `<details open>
<summary>Title</summary>

content
</details>`

    const result = await parse(md)

    expect(result.nodes).toEqual([
      [
        'details',
        { $: { html: 1, block: 1 }, ':open': 'true' },
        ['summary', { $: { html: 1, block: 1 } }, 'Title'],
        ['p', {}, 'content'],
      ],
    ])
  })
})
