import { describe, expect, it } from 'vitest'
import { createMarkdownParser, parseMarkdown } from '../src/index'
import html from '../src/plugins/html'
import { renderMarkdown } from '../src/render'
import { renderHtmlForTest } from './utils/render-html'

const block = { html: 1, block: 1 }
const inline = { html: 1, block: 0 }
const literal = { plugins: [html({ markdown: false })] }

async function roundTrip(source: string, options?: Parameters<typeof parseMarkdown>[1]) {
  const first = await parseMarkdown(source, options)
  const markdown = await renderMarkdown(first)
  return { first, markdown, again: await parseMarkdown(markdown, options), html: await renderHtmlForTest(first) }
}

it('reads <!--- … ---> as a comment inline', async () => {
  const result = await parseMarkdown('a <!--- b ---> c')

  expect(result.nodes).toEqual([['p', {}, 'a ', [null, {}, '- b -'], ' c']])
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

it.each([
  '<pre><code>a &lt;b&gt;c&lt;/b&gt; &amp;amp; &lt;!-- x --&gt;</code></pre>',
  '<pre><script>a &lt; b</script></pre>',
  '<pre><style>a &lt; b</style></pre>',
  '<script>a &lt; b</script>',
  '<pre><!--hi--> a &lt; b</pre>',
  '<pre><code>a</code><!--b--><code>c</code></pre>',
  '<textarea>a &amp; b</textarea>',
  'before <pre>**x** &lt; y</pre> after',
])('parses the saved Markdown of %s back to the same tree', async (source) => {
  const { first, again } = await roundTrip(source)

  expect(again.nodes).toEqual(first.nodes)
})

it('does not treat a name that only starts like a raw tag as one', async () => {
  for (const [name, raw] of [
    ['style-x', 'style'],
    ['pre2', 'pre'],
    ['textarea-1', 'textarea'],
  ]) {
    const result = await parseMarkdown(`a <${name}>**x**</${name}> </${raw}> after`)

    expect(JSON.stringify(result.nodes)).toContain('"strong"')
  }
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

describe('markdown: false', () => {
  it('decodes character references in literal text', async () => {
    const result = await parseMarkdown(
      '<div>\na &amp; b <em>x &lt; y</em> &#65; &copy; &copy &unknown;\n</div>',
      literal
    )

    expect(result.nodes).toEqual([
      ['div', { $: block }, 'a & b ', ['em', { $: inline }, 'x < y'], ' A © &copy &unknown;'],
    ])
  })

  it('decodes the same references as with markdown', async () => {
    const source = '<div>\na &amp; b &lt;i&gt;\n</div>'

    expect((await parseMarkdown(source, literal)).nodes).toEqual((await parseMarkdown(source)).nodes)
  })

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

  it('shows the decoded text of an inline tag as the text it spells', async () => {
    const first = await parseMarkdown('<div><span>&lt;b&gt; &amp;lt;</span></div>', literal)

    expect(await renderHtmlForTest(first)).toBe('<div>\n  <span>&lt;b&gt; &amp;lt;</span>\n</div>')
  })

  it('pairs and leaves unpaired close tags in containers the same as with markdown', async () => {
    for (const source of [
      'a <x-card>one\n\ntwo\n\n</x-card>\n\nlast',
      '> a <x-card>one\n>\n> two\n>\n> </x-card>\n\nlast',
      '- a <x-card>one\n\n  two\n\n  </x-card>\n\nlast',
      'a <b>one\n\n> </b>\n\nlast',
      '> a <b>one\n\n</b>\n\nlast',
    ]) {
      expect((await parseMarkdown(source, literal)).nodes).toEqual((await parseMarkdown(source)).nodes)
    }
  })

  it('keeps Markdown syntax in HTML text literal through a save and a parse, with markdown on and off', async () => {
    for (const options of [undefined, literal]) {
      for (const source of [
        'a <span>\\*x\\*</span>',
        '<div><span>\\*x\\*</span></div>',
        '<div><span>&lt;b&gt; &amp;lt;</span></div>',
        '<div><em>&lt;b&gt; &amp;lt;</em></div>',
        '<div><span><em>&lt;i&gt; &amp;#65;</em></span></div>',
        '<div>\\*x\\* \\[x\\](y) \\`c\\` &#42;n&#42;</div>',
        '<div>\n\\# not a heading\n</div>',
        '<div><span><em>\\_x\\_ &amp;lt;</em></span></div>',
      ]) {
        const first = await parseMarkdown(source, options)
        const again = await parseMarkdown(await renderMarkdown(first), options)

        expect(again.nodes).toEqual(first.nodes)
      }
    }
  })
})
