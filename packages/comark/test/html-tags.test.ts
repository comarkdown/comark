import { describe, expect, it } from 'vitest'
import { createMarkdownParser, parseMarkdown } from '../src/index'
import html from '../src/plugins/html'
import { renderMarkdown } from '../src/render'
import { renderHtmlForTest } from './utils/render-html'

const block = { html: 1, block: 1 }
const inline = { html: 1, block: 0 }

it.each([
  {
    name: 'attribute-jsx-expression',
    input: '<div style={{a: 1}}>\n\nx',
    nodes: [['div', { $: block, style: '{{a: 1}}' }, 'x']],
    html: '<div style="{{a: 1}}">\n  x\n</div>',
    markdown: '<div style="{{a: 1}}">\nx\n</div>',
  },
  {
    name: 'author-paragraph-auto-unwrap',
    input: '<section><p class="c">Check</p></section>',
    nodes: [['section', { $: block }, ['p', { $: inline, class: 'c' }, 'Check']]],
    html: '<section>\n  <p class="c">Check</p>\n</section>',
    markdown: '<section>\n<p class="c">Check</p>\n</section>',
  },
  {
    name: 'block-paragraph-inline-content',
    input: '<div>\n\n![](x.png)\n\na\\\nb\n\n</div>',
    nodes: [['div', { $: block }, ['p', {}, ['img', { src: 'x.png' }]], ['p', {}, 'a', ['br', {}], 'b']]],
    html: '<div>\n  <p><img src="x.png"></p>\n  <p>a<br>b</p>\n</div>',
    markdown: '<div>\n![](x.png)\n\n\na  \nb\n</div>',
    autoUnwrap: false,
  },
  {
    name: 'close-br-tag',
    input: 'a</br>b',
    nodes: [['p', {}, 'a', ['br', { $: inline }], 'b']],
    html: '<p>a<br>b</p>',
    markdown: 'a<br>b',
  },
  {
    name: 'comments-standalone',
    input: '<!-- a -->\n\n<!--- b --->',
    nodes: [
      [null, {}, ' a '],
      [null, {}, '- b -'],
    ],
    html: '<!-- a -->\n<!--- b --->',
    markdown: '<!-- a -->\n\n<!--- b --->',
  },
  {
    name: 'duplicate-attributes',
    input: '<img alt="first" alt="second">',
    nodes: [['img', { $: block, alt: 'first' }]],
    html: '<img alt="first">',
    markdown: '<img alt="first">',
  },
  {
    name: 'p-closes-p',
    input: '<p>\none\n<p>\ntwo',
    nodes: [
      ['p', { $: inline }, 'one'],
      ['p', { $: inline }, 'two'],
    ],
    html: '<p>one</p>\n<p>two</p>',
    markdown: '<p>one</p>\n\n<p>two</p>',
  },
  {
    name: 'pre-code',
    input: '<pre><code>x &lt; y</code></pre>',
    nodes: [['pre', { $: block }, ['code', { $: inline }, 'x < y']]],
    html: '<pre><code>x &lt; y</code></pre>',
    markdown: '<pre><code>x &lt; y</code></pre>',
  },
  {
    name: 'unclosed-after-text',
    input: 'GET /apps/<id>\n\nNext paragraph.',
    nodes: [
      ['p', {}, 'GET /apps/', ['id', { $: inline }]],
      ['p', {}, 'Next paragraph.'],
    ],
    html: '<p>\n  GET /apps/<id></id>\n</p>\n<p>Next paragraph.</p>',
    markdown: 'GET /apps/<id></id>\n\nNext paragraph.',
  },
  {
    name: 'unclosed-in-list',
    input: '- **a** <b>c',
    nodes: [['ul', {}, ['li', {}, ['strong', {}, 'a'], ' ', ['b', { $: inline }, 'c']]]],
    html: '<ul>\n  <li>\n    <strong>a</strong> <b>c</b>\n  </li>\n</ul>',
    markdown: '- **a** <b>c</b>',
  },
])('$name', async ({ input, nodes, html, markdown, ...options }) => {
  const document = await parseMarkdown(input, options)
  expect(document).toEqual({ frontmatter: {}, meta: {}, nodes })
  expect(await renderHtmlForTest(document)).toBe(html)
  expect(await renderMarkdown(document)).toBe(markdown)
})

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

describe('literal text round trip', () => {
  const literal = { plugins: [html({ markdown: false })] }

  async function roundTrip(source: string, options?: Parameters<typeof parseMarkdown>[1]) {
    const first = await parseMarkdown(source, options)
    const markdown = await renderMarkdown(first)
    return { first, markdown, again: await parseMarkdown(markdown, options), html: await renderHtmlForTest(first) }
  }

  it('shows an encoded reference in <pre>, <textarea> and a literal block as the text it spells', async () => {
    for (const source of [
      '<pre><code>&amp;lt;b&amp;gt;</code></pre>',
      '<textarea>&amp;lt;b&amp;gt;</textarea>',
      '<div>&amp;lt;b&amp;gt;</div>',
    ]) {
      const { first, markdown, again, html: output } = await roundTrip(source, literal)

      expect(output).toContain('&amp;lt;b&amp;gt;')
      expect(output).not.toContain('&lt;b&gt;')
      expect(again.nodes).toEqual(first.nodes)
      expect(markdown).toContain('&amp;lt;b&amp;gt;')
    }
  })

  it('writes decoded < and & in a literal block back as references', async () => {
    const { first, markdown, again, html: output } = await roundTrip('<div>\n&lt;b&gt; &amp; x\n</div>', literal)

    expect(first.nodes).toEqual([['div', { $: block }, '<b> & x']])
    expect(markdown).toBe('<div>\n&lt;b> & x\n</div>')
    expect(again.nodes).toEqual(first.nodes)
    expect(output).toBe('<div>\n  &lt;b&gt; & x\n</div>')
  })

  it('keeps reference-looking text and a decoded <!-- as text', async () => {
    const source = '<div>\n&amp;foo; &amp;copy &#38;amp; &#38;#65; &lt;!-- c --&gt; AT&T\n</div>'
    const { first, markdown, again, html: output } = await roundTrip(source, literal)

    expect(first.nodes).toEqual([['div', { $: block }, '&foo; &copy &amp; &#65; <!-- c --> AT&T']])
    expect(again.nodes).toEqual(first.nodes)
    expect(output).toBe('<div>\n  &amp;foo; &amp;copy &amp;amp; &amp;#65; &lt;!-- c --&gt; AT&amp;T\n</div>')
    expect(markdown).not.toContain('<!--')
  })

  it('keeps script and style references as written, also inside <pre>', async () => {
    for (const source of [
      '<pre><script>a &lt; b</script></pre>',
      '<pre><style>a &lt; b</style></pre>',
      '<script>a &lt; b</script>',
    ]) {
      const { first, markdown, again } = await roundTrip(source)

      expect(markdown).toBe(source)
      expect(again.nodes).toEqual(first.nodes)
    }
  })

  it('keeps every character of a comment inside <pre>', async () => {
    for (const source of ['<pre><!--hi--> a &lt; b</pre>', '<pre><code>a</code><!--b--><code>c</code></pre>']) {
      const { first, markdown, again, html: output } = await roundTrip(source)

      expect(markdown).toBe(source)
      expect(output).toBe(source)
      expect(again.nodes).toEqual(first.nodes)
    }
  })

  it('keeps a <textarea> body free of added newlines', async () => {
    const { first, markdown, again } = await roundTrip('<textarea>a &amp; b</textarea>')

    expect(first.nodes).toEqual([['textarea', { $: block }, 'a & b']])
    expect(markdown).toBe('<textarea>a &amp; b</textarea>')
    expect(again.nodes).toEqual(first.nodes)
  })

  it('does not read markdown in a <pre> that follows text', async () => {
    const source = 'before <pre>**x** &lt; y</pre> after'
    const { first, markdown, again, html: output } = await roundTrip(source)

    expect(first.nodes).toEqual([['p', {}, 'before ', ['pre', { $: inline }, '**x** < y'], ' after']])
    expect(markdown).toBe(source)
    expect(output).toBe('<p>before <pre>**x** &lt; y</pre> after</p>')
    expect(again.nodes).toEqual(first.nodes)
  })

  it('keeps a <pre> after text unindented in the paragraph', async () => {
    const { html: output } = await roundTrip('before <pre>\nline\n  indented</pre> after')

    expect(output).toBe('<p>before <pre>\nline\n  indented</pre> after</p>')
  })
})

describe('large inputs', () => {
  // Correctness at a size where a quadratic scan would time out the suite; scaling is measured by hand.
  it('parses many unpaired raw openers in one paragraph', async () => {
    const result = await parseMarkdown('a <textarea>'.repeat(5000), { autoClose: false })

    expect(result.nodes).toHaveLength(1)
  })

  it('parses many adjacent tags and unpaired openers', async () => {
    const tags = await parseMarkdown('<b></b>'.repeat(5000), { autoClose: false })
    const pre = await parseMarkdown(`<pre>${'Array<string> '.repeat(5000)}</pre>`, { autoClose: false })
    const prose = await parseMarkdown('GET /apps/<id>\n\n'.repeat(5000), { autoClose: false })

    expect(tags.nodes).toHaveLength(5000)
    expect(pre.nodes).toHaveLength(1)
    expect(prose.nodes).toHaveLength(5000)
  })
})

describe('exact raw tag names', () => {
  it('does not treat <script-x> or a name with a digit as a raw element', async () => {
    const result = await parseMarkdown('a <script-x>**x**</script-x> </script> after')

    expect(result.nodes).toEqual([['p', {}, 'a ', ['script-x', { $: inline }, ['strong', {}, 'x']], '  after']])
    for (const name of ['style-x', 'pre2', 'textarea-1', 'prelude']) {
      const other = await parseMarkdown(`a <${name}>**x**</${name}> </${name.replace(/[-\d]+.*|lude/, '')}> after`)

      expect(JSON.stringify(other.nodes)).toContain('"strong"')
    }
  })

  it('still reads an exact <script> as raw inline', async () => {
    const result = await parseMarkdown('a <script>**x**</script> after')

    expect(result.nodes).toEqual([['p', {}, 'a ', ['script', { $: inline }, '**x**'], ' after']])
  })
})

describe('closing tags inside containers without markdown', () => {
  const literal = { plugins: [html({ markdown: false })] }
  const sources = [
    'a <x-card>one\n\ntwo\n\n</x-card>\n\nlast',
    '> a <x-card>one\n>\n> two\n>\n> </x-card>\n\nlast',
    '- a <x-card>one\n\n  two\n\n  </x-card>\n\nlast',
    'a <b>one\n\n> </b>\n\nlast',
    '> a <b>one\n\n</b>\n\nlast',
  ]

  it('pairs and leaves unpaired tags the same as with markdown', async () => {
    for (const source of sources) {
      const withMarkdown = await parseMarkdown(source)
      const without = await parseMarkdown(source, literal)

      expect(without.nodes).toEqual(withMarkdown.nodes)
    }
  })

  it('pairs a closer in the same container', async () => {
    const result = await parseMarkdown(sources[0], literal)

    expect(result.nodes[0]).toBe('a ')
    expect(JSON.stringify(result.nodes)).toContain('["x-card"')
  })
})

describe('literal text in inline tags', () => {
  const literal = { plugins: [html({ markdown: false })] }

  it('survives the Markdown round trip at any depth', async () => {
    for (const source of [
      '<div><span>&lt;b&gt; &amp;lt;</span></div>',
      '<div><em>&lt;b&gt; &amp;lt;</em></div>',
      '<div><span><em>&lt;i&gt; &amp;#65;</em></span></div>',
    ]) {
      const first = await parseMarkdown(source, literal)
      const markdown = await renderMarkdown(first)
      const again = await parseMarkdown(markdown, literal)

      expect(markdown).not.toContain('\\')
      expect(again.nodes).toEqual(first.nodes)
    }
  })

  it('shows the text it spells in HTML', async () => {
    const first = await parseMarkdown('<div><span>&lt;b&gt; &amp;lt;</span></div>', literal)

    expect(await renderHtmlForTest(first)).toBe('<div>\n  <span>&lt;b&gt; &amp;lt;</span>\n</div>')
  })

  it('still escapes Markdown text in an inline tag', async () => {
    const first = await parseMarkdown('a <span>\\*x\\*</span>')
    const markdown = await renderMarkdown(first)

    expect((await parseMarkdown(markdown)).nodes).toEqual(first.nodes)
  })
})

describe('markup in <pre>', () => {
  it('adds no whitespace between sibling tags or comments', async () => {
    for (const source of [
      '<pre><b>a</b><b>b</b></pre>',
      '<pre><!--a--><b>x</b><!--b--></pre>',
      '<pre><span><b>a</b><i>b</i></span><b>c</b></pre>',
    ]) {
      const first = await parseMarkdown(source)

      expect(await renderHtmlForTest(first)).toBe(source)
      expect(await renderMarkdown(first)).toBe(source)
    }
  })
})

describe('a close tag in another container', () => {
  it('does not pair with an open tag in the surrounding prose', async () => {
    const result = await parseMarkdown('a <b>one\n\n::card\n</b>\n::\n\nlast')

    expect(result.nodes).toEqual([
      ['p', {}, 'a ', ['b', { $: inline }, 'one']],
      ['card', {}],
      ['p', {}, 'last'],
    ])
  })

  it('does not pair with an open tag before a blockquote', async () => {
    const result = await parseMarkdown('a <b>one\n\n> </b>\n\nlast')

    expect(result.nodes[0]).toEqual(['p', {}, 'a ', ['b', { $: inline }, 'one']])
  })

  it('still pairs a close tag in a later paragraph of the same container', async () => {
    const quote = await parseMarkdown('> text <x-card>\n>\n> **a**\n>\n> </x-card>\n\nlast')
    const list = await parseMarkdown('- text <x-card>\n\n  **a**\n\n  </x-card>\n\nlast')

    expect(quote.nodes[0]).toEqual(['blockquote', {}, 'text ', ['x-card', { $: inline }, ['strong', {}, 'a']]])
    expect(list.nodes[0]).toEqual(['ul', {}, ['li', {}, 'text ', ['x-card', { $: inline }, ['strong', {}, 'a']]]])
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

describe('Markdown syntax in HTML text', () => {
  const sources = [
    '<div><span>\\*x\\*</span></div>',
    '<div>\\*x\\* \\[x\\](y) \\`c\\` &#42;n&#42;</div>',
    '<div>\n\\# not a heading\n</div>',
    '<div><span><em>\\_x\\_ &amp;lt;</em></span></div>',
  ]

  it('stays literal text through a save and a parse, with markdown on and off', async () => {
    for (const options of [undefined, { plugins: [html({ markdown: false })] }]) {
      for (const source of sources) {
        const first = await parseMarkdown(source, options)
        const again = await parseMarkdown(await renderMarkdown(first), options)

        expect(again.nodes).toEqual(first.nodes)
      }
    }
  })

  it('keeps a parsed strong and link next to the text', async () => {
    const first = await parseMarkdown('<div>\\*x\\* **b** [l](/u)</div>')
    const markdown = await renderMarkdown(first)
    const again = await parseMarkdown(markdown)

    expect(JSON.stringify(first.nodes)).toContain('"strong"')
    expect(JSON.stringify(first.nodes)).toContain('"a"')
    expect(again.nodes).toEqual(first.nodes)
  })
})
