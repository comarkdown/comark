import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index'
import { renderMarkdown } from '../src/render'
import mermaid from '../src/plugins/mermaid'
import type { MarkdownDocument } from '../src/types'

async function roundTrip(md: string, options?: Parameters<typeof parseMarkdown>[1]) {
  const t1 = await parseMarkdown(md, options)
  const rendered = await renderMarkdown(t1)
  const t2 = await parseMarkdown(rendered, options)
  return { t1, t2, rendered }
}

describe('code fence selection', () => {
  it('picks a fence that content with both ``` and ~~~ cannot close', async () => {
    const code = 'let a = 1\n```\n~~~\n::alert\nowned\n::'
    const doc = {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'js' }, ['code', { class: 'language-js' }, code]]],
    } as unknown as MarkdownDocument
    const rendered = await renderMarkdown(doc)
    const t2 = await parseMarkdown(rendered)
    expect(t2.nodes).toEqual(doc.nodes)
  })

  it('widens the fence past the longest backtick run in the content', async () => {
    const code = 'const s = ""\n````\nend'
    const doc = {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'js' }, ['code', { class: 'language-js' }, code]]],
    } as unknown as MarkdownDocument
    const rendered = await renderMarkdown(doc)
    const t2 = await parseMarkdown(rendered)
    expect(t2.nodes).toEqual(doc.nodes)
  })
})

describe('inline code fence selection', () => {
  const cases: Record<string, string> = {
    'a lone backtick': 'Type `` ` `` to start code.',
    'a leading and trailing backtick': '`` `a` ``',
    'a double backtick run': '`a``b`',
    'a leading and trailing space': '`  a  `',
  }

  for (const [name, md] of Object.entries(cases)) {
    it(`keeps code with ${name}`, async () => {
      const { t1, t2 } = await roundTrip(md)
      expect(t2.nodes).toEqual(t1.nodes)
    })
  }

  it('keeps the attributes of code that starts with a backtick', async () => {
    const { t1, t2, rendered } = await roundTrip('`` `foo` ``{lang="md"}')
    expect(rendered).toBe('`` `foo` ``{lang="md"}')
    expect(t2.nodes).toEqual(t1.nodes)
  })

  it('keeps the output of code that already round-tripped', async () => {
    const { rendered } = await roundTrip('`a` ``b`c`` ` d`')
    expect(rendered).toBe('`a` ``b`c`` ` d`')
  })
})

describe('mermaid fence selection', () => {
  it('does not let mermaid content escape its fence', async () => {
    // A mermaid body containing ``` must not terminate the serialized fence
    const md = '````mermaid\ngraph TD\n```\nA --> B\n````'
    const { t1, t2 } = await roundTrip(md, { plugins: [mermaid()] })
    expect(t2.nodes).toEqual(t1.nodes)
  })
})

describe('component marker escaping', () => {
  it('keeps escaped :: markers as literal text through a round trip', async () => {
    const { t2 } = await roundTrip('\\:\\:alert')
    expect(t2.nodes).toEqual([['p', {}, '::alert']])
  })

  it('keeps entity-encoded :: markers as literal text through a round trip', async () => {
    const { t2 } = await roundTrip('&#58;&#58;alert')
    expect(t2.nodes).toEqual([['p', {}, '::alert']])
  })

  it('escapes a bare :: line inside block component content', async () => {
    // The middle paragraph is the literal text `::` (escaped in the source),
    // which must not become a fence close after serialization.
    const md = '::card\nfirst\n\n\\::\n\nsecond\n::'
    const { t1, t2 } = await roundTrip(md)
    expect(t2.nodes).toEqual(t1.nodes)
  })

  it('escapes inline component markers in text', async () => {
    const { t2 } = await roundTrip('type \\:alert to continue')
    expect(t2.nodes).toEqual([['p', {}, 'type :alert to continue']])
  })

  it('escapes attribute block openers after inline elements', async () => {
    const { t2 } = await roundTrip('**bold** \\{.red}')
    expect(t2.nodes).toEqual([['p', {}, ['strong', {}, 'bold'], ' {.red}']])
  })
})

describe('comarkAttributes quoting', () => {
  it('round-trips attribute values containing double quotes', async () => {
    // The text sibling keeps the span inline in both parses (a lone
    // `:span[...]` line is a leaf block component — pre-existing asymmetry).
    const md = `say :span[hi]{title='a"b'} now`
    const { t1, t2 } = await roundTrip(md)
    expect(t2.nodes).toEqual(t1.nodes)
  })

  it('does not let a quoted value inject a new attribute on re-parse', async () => {
    const md = `:span[hi]{title='x" bad="1'}`
    const { t2 } = await roundTrip(md)
    const span = (t2.nodes[0] as any[])[2] // p > span
    expect(span[1].title).toBe('x" bad="1')
    expect(span[1].bad).toBeUndefined()
  })
})

describe('line breaks', () => {
  it.each([
    ['before a word', ['p', {}, 'a ', ['br', {}], ' b']],
    ['after a component', ['p', {}, 'A ', ['badge', {}, 'x'], ' ', ['br', {}], ' word']],
    ['after inline code', ['p', {}, ['code', {}, 'x'], ' ', ['br', {}], '\ny']],
    ['between breaks', ['p', {}, 'a ', ['br', {}], ' ', ['br', {}], ' b']],
  ])('round-trips a break %s', async (_, node) => {
    const doc = { frontmatter: {}, meta: {}, nodes: [node] } as unknown as MarkdownDocument
    const t2 = await parseMarkdown(await renderMarkdown(doc))
    expect(t2.nodes).toEqual(doc.nodes)
  })
})

describe('component after a list', () => {
  it.each([
    ['in the default slot', '::card\n- one\n- two\n\n:::note\nhi\n:::\n::'],
    ['in a named slot', '::card\n#content\n- one\n- two\n\n:::note\nhi\n:::\n::'],
    [
      'in one of several named slots, after an ordered list',
      '::card\n#title\nTitle\n\n#content\n1. one\n2. two\n\n:::note\nhi\n:::\n\nafter\n\n#footer\nFooter\n::',
    ],
    ['two components deep', '::outer\n:::mid\n- one\n- two\n\n::::inner\nhi\n::::\n:::\n::'],
    ['two components deep in a named slot', '::outer\n:::mid\n#content\n- one\n\n::::inner\nhi\n::::\n:::\n::'],
    ['whose last item has nested content', '::card\n- one\n- two\n  - nested\n\n  more\n\n:::note\nhi\n:::\n::'],
    [
      'whose last item has nested content, in a named slot',
      '::card\n#content\n- one\n- two\n  - nested\n\n:::note\nhi\n:::\n::',
    ],
    [
      'when the component has its own named slots',
      '::card\n#content\n- one\n\n:::note\n#title\nT\n\n#body\nB\n:::\n\n#footer\nF\n::',
    ],
  ])('keeps a component %s out of the last list item', async (_, md) => {
    const { t1, t2 } = await roundTrip(md)
    expect(t2.nodes).toEqual(t1.nodes)
  })
})

describe('link and image serialization', () => {
  const doc = (node: unknown) =>
    ({ frontmatter: {}, meta: {}, nodes: [['p', {}, node]] }) as unknown as MarkdownDocument

  // The URL the security plugin validated must be the URL a CommonMark reader sees.
  it.each([
    ['an unbalanced ")"', 'https://safe.com)javascript:alert(1)'],
    ['an unbalanced "("', 'https://a.com/(x'],
    ['balanced parentheses', 'https://en.wikipedia.org/wiki/Foo_(bar)'],
    ['an entity-like "&"', 'https://a.com/?a=1&amp;b=2'],
    ['a plain "&"', 'https://a.com/?a=1&b=2'],
    ['percent escapes', 'https://a.com/a%20b'],
  ])('keeps an href with %s', async (_, href) => {
    const rendered = await renderMarkdown(doc(['a', { href }, 'x']))
    const t2 = await parseMarkdown(rendered)
    expect((t2.nodes[0] as any)[2][1].href).toBe(href)
  })

  it('keeps an image src with an unbalanced ")"', async () => {
    const src = 'https://safe.com)javascript:alert(1)'
    const t2 = await parseMarkdown(await renderMarkdown(doc(['img', { src, alt: 'x' }])))
    expect((t2.nodes[0] as any)[2][1].src).toBe(src)
  })

  // `\` is `/` to the browser in an http URL, but a markdown reader encodes it as
  // `%5C`, which would turn `example.com\` into userinfo and evil.com into the host.
  it.each(['https://example.com\\@evil.com/x', 'https:\\\\example.com\\@evil.com/x'])(
    'keeps the host of %s',
    async (href) => {
      const t2 = await parseMarkdown(await renderMarkdown(doc(['a', { href }, 'x'])))
      const out = (t2.nodes[0] as any)[2][1].href
      expect(new URL(out).origin).toBe(new URL(href).origin)
    }
  )

  it('keeps a relative URL with a backslash on the same origin', async () => {
    const t2 = await parseMarkdown(await renderMarkdown(doc(['a', { href: '\\\\evil.com/x' }, 'x'])))
    const out = (t2.nodes[0] as any)[2][1].href
    expect(new URL(out, 'https://app.example/').origin).toBe('https://app.example')
  })

  it('keeps alt text from the parser as written', async () => {
    for (const md of ['![a\\](b) \\[c](/a.png)', '![[a]](/a.png)', '![a &lt; b](/a.png)']) {
      const { t1, t2 } = await roundTrip(md)
      expect(t2.nodes).toEqual(t1.nodes)
    }
  })

  it('does not let alt text or a title break out of the image', async () => {
    const rendered = await renderMarkdown(
      doc(['img', { src: '/a.png', alt: 'a](https://evil.com/x) [', title: 'say "hi" \\ <iframe>' }])
    )
    const img = ((await parseMarkdown(rendered)).nodes[0] as any)[2]
    expect(img[1].src).toBe('/a.png')
    expect(img[1].title).toBe('say "hi" \\ <iframe>')
    expect((await parseMarkdown(rendered)).nodes[0]).toHaveLength(3)
  })

  it('writes a missing or empty destination as <>, so a title is not read as the URL', async () => {
    for (const attrs of [{ title: '<iframe src=javascript:alert(1)>' }, { src: '', title: 'javascript:alert(1)' }]) {
      const rendered = await renderMarkdown(doc(['img', { alt: 'x', ...attrs }]))
      expect(rendered).toMatch(/\]\(<> "/)
      const img = ((await parseMarkdown(rendered)).nodes[0] as any)[2]
      expect(img[0]).toBe('img')
      expect(img[1].src).toBeUndefined()
      expect(img[1].title).toBe(attrs.title)
    }
    expect(await renderMarkdown(doc(['a', {}, 'x']))).toBe('[x](<>)')
  })

  it('only writes an autolink when the URL can be one', async () => {
    expect(await renderMarkdown(doc(['a', { href: 'https://a.com/x' }, 'https://a.com/x']))).toBe('<https://a.com/x>')
    const href = 'https://a.com/>x'
    const rendered = await renderMarkdown(doc(['a', { href }, href]))
    expect(rendered).not.toMatch(/^</)
    // `>` is percent-encoded by the parser, as for any link destination
    expect(decodeURI(((await parseMarkdown(rendered)).nodes[0] as any)[2][1].href)).toBe(href)
  })
})
