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

describe('implied end tags', () => {
  it('reads a stray </br> as a line break', async () => {
    const result = await parseMarkdown('a</br>b')

    expect(result.nodes).toEqual([['p', {}, 'a', ['br', { $: inline }], 'b']])
  })

  it('closes an open <p> when another <p> starts', async () => {
    const result = await parseMarkdown('<p>\none\n<p>\ntwo')

    expect(result.nodes).toEqual([
      ['p', { $: inline }, 'one'],
      ['p', { $: inline }, 'two'],
    ])
  })

  it('closes an open <p> across blocks and inline elements', async () => {
    const result = await parseMarkdown('<div>\n\n<p>a <b>x\n\n<p>b\n\n</div>')

    expect(result.nodes).toEqual([
      ['div', { $: block }, ['p', { $: block }, 'a ', ['b', { $: block }, 'x']], ['p', { $: block }, 'b']],
    ])
  })

  it('keeps a <p> nested in a table cell inside the outer <p>', async () => {
    const result = await parseMarkdown('<p>a<table><tr><td><p>b</td></tr></table>')

    expect(result.nodes).toEqual([
      [
        'p',
        { $: block },
        'a',
        ['table', { $: inline }, ['tr', { $: inline }, ['td', { $: inline }, ['p', { $: inline }, 'b']]]],
      ],
    ])
  })

  it('renders consecutive <p> tags as siblings', async () => {
    const result = await parseMarkdown('<p>one\n<p>two')

    expect(await renderHtmlForTest(result)).toBe('<p>one</p>\n<p>two</p>')
  })
})

describe('inline content inside block HTML', () => {
  const md = '<div>\n\nhello ![](x.png) a  \nb :badge[x] <my-el>y</my-el> <br> end\n\n</div>'

  it('keeps images, line breaks, components and custom elements in their paragraph', async () => {
    const result = await parseMarkdown(md, { autoUnwrap: false })

    expect(result.nodes).toEqual([
      [
        'div',
        { $: block },
        [
          'p',
          {},
          'hello ',
          ['img', { src: 'x.png' }],
          ' a',
          ['br', {}],
          'b ',
          ['badge', {}, 'x'],
          ' ',
          ['my-el', { $: inline }, 'y'],
          ' ',
          ['br', { $: inline }],
          ' end',
        ],
      ],
    ])
  })

  it('wraps a markdown image on its own in a paragraph', async () => {
    const result = await parseMarkdown('<div>\n\n![](x.png)\n\n![](y.png)\n\n</div>', { autoUnwrap: false })

    expect(result.nodes).toEqual([
      ['div', { $: block }, ['p', {}, ['img', { src: 'x.png' }]], ['p', {}, ['img', { src: 'y.png' }]]],
    ])
  })

  it('leaves an author-written element on its own as a block', async () => {
    const result = await parseMarkdown('<div>\n\n<my-el>y</my-el>\n\n<img src="a">\n\n</div>', { autoUnwrap: false })

    expect(result.nodes).toEqual([
      ['div', { $: block }, ['my-el', { $: inline }, 'y'], ['img', { $: inline, src: 'a' }]],
    ])
  })

  it('keeps the order of a closed element and the one that follows it in a list item', async () => {
    const result = await parseMarkdown('- <div>a</div><div>b\n- c')

    expect(result.nodes).toEqual([
      ['ul', {}, ['li', {}, ['div', { $: inline }, 'a'], ['div', { $: inline }, 'b']], ['li', {}, 'c']],
    ])
  })
})

describe('an open tag after text', () => {
  it('ends with its paragraph when nothing closes it', async () => {
    const result = await parseMarkdown('GET /apps/<id>\n\nNext paragraph.')

    expect(result.nodes).toEqual([
      ['p', {}, 'GET /apps/', ['id', { $: inline }]],
      ['p', {}, 'Next paragraph.'],
    ])
  })

  it('ends with its paragraph inside a block element', async () => {
    const result = await parseMarkdown('<div>\n\nHello <b>x\n\nmore\n\n</div>', { autoUnwrap: false })

    expect(result.nodes).toEqual([
      ['div', { $: block }, ['p', {}, 'Hello ', ['b', { $: inline }, 'x']], ['p', {}, 'more']],
    ])
  })

  it('keeps the text before a tag that a later paragraph closes', async () => {
    const result = await parseMarkdown('text <x-card>\n\n**a**\n\n</x-card>')

    expect(result.nodes).toEqual(['text ', ['x-card', { $: block }, ['strong', {}, 'a']]])
  })

  it('still lets a tag at the start of its paragraph collect the blocks after it', async () => {
    const result = await parseMarkdown('<ai-thinking>\n\nNext paragraph.')

    expect(result.nodes).toEqual([['ai-thinking', { $: block }, 'Next paragraph.']])
  })

  it('keeps markdown before the tag in its list item', async () => {
    const result = await parseMarkdown('- **a** <b>c\n- d')

    expect(result.nodes).toEqual([
      ['ul', {}, ['li', {}, ['strong', {}, 'a'], ' ', ['b', { $: inline }, 'c']], ['li', {}, 'd']],
    ])
  })

  it('settles on the paired tree once the closer streams in', async () => {
    const source = 'text <x-card>\n\n**a**\n\n</x-card>'
    const parse = createMarkdownParser()
    for (let end = 1; end < source.length; end++) {
      await expect(parse(source.slice(0, end))).resolves.toBeDefined()
    }

    expect((await parse(source)).nodes).toEqual((await parseMarkdown(source)).nodes)
    expect((await parse('text <x-card>\n\n**a**')).nodes).toEqual([
      ['p', {}, 'text ', ['x-card', { $: inline }]],
      ['p', {}, ['strong', {}, 'a']],
    ])
  })
})

describe('standalone comments', () => {
  it('does not wrap an indented comment in a paragraph', async () => {
    const result = await parseMarkdown('  <!-- a -->\n\n   <!--- b --->')

    expect(result.nodes).toEqual([
      [null, {}, ' a '],
      [null, {}, '- b -'],
    ])
  })

  it('keeps the comment of a closed block inside its element', async () => {
    const result = await parseMarkdown('<div>\n  <!-- x -->\n  text\n</div>')

    expect(result.nodes).toEqual([['div', { $: block }, [null, {}, ' x '], 'text']])
  })
})

describe('character references and <pre>', () => {
  const literal = { plugins: [html({ markdown: false })] }

  it('decodes character references in literal text when markdown: false', async () => {
    const result = await parseMarkdown(
      '<div>\na &amp; b <em>x &lt; y</em> &#65; &copy; &copy &unknown;\n</div>',
      literal
    )

    expect(result.nodes).toEqual([
      ['div', { $: block }, 'a & b ', ['em', { $: inline }, 'x < y'], ' A © &copy &unknown;'],
    ])
  })

  it('decodes the same references with and without markdown', async () => {
    const source = '<div>\na &amp; b &lt;i&gt;\n</div>'

    const withMarkdown = await parseMarkdown(source)
    const withoutMarkdown = await parseMarkdown(source, literal)

    expect(withoutMarkdown.nodes).toEqual(withMarkdown.nodes)
  })

  it('does not read a decoded <!-- as a comment', async () => {
    const result = await parseMarkdown('<pre>&lt;!-- x --&gt;</pre>')

    expect(result.nodes).toEqual([['pre', { $: block }, '<!-- x -->']])
  })

  it('parses the tags inside <pre> and decodes its text', async () => {
    const result = await parseMarkdown('<pre><code class="language-js">x &lt; y &amp; <span>z</span></code></pre>')

    expect(result.nodes).toEqual([
      ['pre', { $: block }, ['code', { $: inline, class: 'language-js' }, 'x < y & ', ['span', { $: inline }, 'z']]],
    ])
    expect(await renderHtmlForTest(result)).toBe(
      '<pre><code class="language-js">x &lt; y & <span>z</span></code></pre>'
    )
  })

  it('keeps whitespace and markdown in <pre> verbatim', async () => {
    const result = await parseMarkdown('<pre>\n  const x = 1\n  **not**\n  <b>b</b>\n</pre>\n\nafter')

    expect(result.nodes).toEqual([
      ['pre', { $: block }, '\n  const x = 1\n  **not**\n  ', ['b', { $: inline }, 'b'], '\n'],
      ['p', {}, 'after'],
    ])
  })

  it('keeps an open tag in <pre> with no closer as text', async () => {
    const result = await parseMarkdown('<pre>const a: Array<string> = []\n</pre>\n\nafter')

    expect(result.nodes).toEqual([
      ['pre', { $: block }, 'const a: Array<string> = []\n'],
      ['p', {}, 'after'],
    ])
  })

  it('decodes <textarea> text and leaves <script> and <style> alone', async () => {
    const result = await parseMarkdown(
      '<textarea>a &lt; b</textarea>\n\n<script>a &lt; b</script>\n\n<style>a &lt; b</style>'
    )

    expect(result.nodes).toEqual([
      ['textarea', { $: block }, 'a < b'],
      ['script', { $: block }, 'a &lt; b'],
      ['style', { $: block }, 'a &lt; b'],
    ])
  })

  it('writes the decoded text of <pre> back as references', async () => {
    const source = '<pre><code>a &lt;b&gt;c&lt;/b&gt; &amp;amp; &lt;!-- x --&gt;</code></pre>'
    const first = await parseMarkdown(source)
    const rendered = await renderMarkdown(first)

    expect(rendered).toBe('<pre><code>a &lt;b>c&lt;/b> &amp;amp; &lt;!-- x --></code></pre>')
    expect((await parseMarkdown(rendered)).nodes).toEqual(first.nodes)
  })
})

describe('autoUnwrap', () => {
  it('keeps a <p> the author wrote, with its attributes', async () => {
    const source = '<section><p class="c">Check</p></section>'

    for (const autoUnwrap of [true, false]) {
      const result = await parseMarkdown(source, { autoUnwrap })

      expect(result.nodes).toEqual([['section', { $: block }, ['p', { $: inline, class: 'c' }, 'Check']]])
    }
  })

  it('still unwraps the paragraph markdown wraps around a single line', async () => {
    const result = await parseMarkdown('<section>\n\nCheck\n\n</section>')

    expect(result.nodes).toEqual([['section', { $: block }, 'Check']])
  })
})
