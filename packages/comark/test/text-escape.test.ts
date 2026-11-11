import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index'
import { renderMarkdown } from '../src/render'
import type { MarkdownDocument } from '../src'

const paragraph = (...children: unknown[]): MarkdownDocument =>
  ({ frontmatter: {}, meta: {}, nodes: [['p', {}, ...children]] }) as MarkdownDocument

// A text node round-trips when re-parsing the rendered markdown yields the same
// literal text, instead of reinterpreting a character as markdown syntax.
async function roundTrip(text: string) {
  const md = await renderMarkdown(paragraph(text))
  const node = ((await parseMarkdown(md)) as any).nodes[0]
  return { md, node }
}

describe('text node escaping', () => {
  describe('escapes syntax that would otherwise be reparsed', () => {
    const cases: Record<string, string> = {
      'code span': 'use `ls` here',
      emphasis: 'a *b* and _c_ d',
      strikethrough: 'a ~~b~~ c',
      'raw html': 'render a <div> tag',
      entity: 'the &amp; entity',
      backslash: 'two \\\\ backslashes',
      'link brackets': '[foo](bar)',
      'leading heading': '# not a heading',
      'leading blockquote': '> not a quote',
      'leading bullet': '- not a list',
      'leading ordered list': '1. not a list',
      'leading thematic break': '--- not a rule',
    }

    for (const [name, text] of Object.entries(cases)) {
      it(name, async () => {
        const { node } = await roundTrip(text)
        expect(node).toEqual(['p', {}, text])
      })
    }
  })

  describe('leaves prose untouched when a character is not significant', () => {
    // Emphasis `_`, raw html `<` and entity `&` only start a construct in
    // certain positions, and block markers only at the start of a line.
    const clean = [
      'snake_case stays',
      'a_b_c',
      'a < b compare',
      // 'a<b tight',
      'x < y > z',
      'AT&T rocks',
      'r&d team',
      '#hashtag not a heading',
      '-dash not a bullet',
      '1.2 version',
      'C# and F#',
      'a heading # mid line',
    ]

    for (const text of clean) {
      it(text, async () => {
        const { md, node } = await roundTrip(text)
        expect(md).toBe(text)
        expect(node).toEqual(['p', {}, text])
      })
    }
  })

  it('escapes leading block markers only after a real line break', async () => {
    // `# heading` sits mid-line, so it stays literal; `- bullet` starts a line.
    const text = 'inline # heading\n- bullet'
    const { node } = await roundTrip(text)
    expect(node).toEqual(['p', {}, text])
  })

  it('does not escape markdown inside a raw HTML block', async () => {
    // Raw HTML block content is copied verbatim on parse, so `**World**` must
    // not gain backslashes.
    const document = await parseMarkdown('<Hello>\nHello **World**\n</Hello>')
    const md = await renderMarkdown(document)
    expect(md).toContain('Hello **World**')
    expect(md).not.toContain('\\*')
  })

  it('escapes literal text before colon-prefixed component names to prevent reparsing as an inline component', async () => {
    // "word]:name" would reparse as a component if not escaped.
    const text = 'word]:name'
    const { node } = await roundTrip(text)
    expect(node).toEqual(['p', {}, text])
  })

  it('escapes literal text before colon-prefixed component names to prevent reparsing as an inline component', async () => {
    const text = 'word]:name'
    const { md, node } = await roundTrip(text)
    // The colon should be escaped to prevent re-parsing as an inline component.
    expect(md).toContain('\\:name')
    expect(node).toEqual(['p', {}, text])
  })
})

describe('tag openers split across nodes', () => {
  // The `>` of `<img …>` can sit in a later sibling, past an element node.
  // Written back unescaped, a CommonMark reader would join them into one tag.
  it.each([
    ['p', {}, 'x <img src="data:image/svg+xml,', ['svg', { $: { html: 1, block: 0 } }], '"> y'],
    ['p', {}, 'a <img src=x onerror=alert(1) ', ['em', {}, 'z'], ' >'],
    ['p', {}, 'a </div ', ['em', {}, 'z'], '>'],
  ])('escapes the opener in %j', async (...node) => {
    const md = await renderMarkdown({ frontmatter: {}, meta: {}, nodes: [node] } as unknown as MarkdownDocument)
    expect(md).toMatch(/\\<\/?[a-z]/)
    expect((await parseMarkdown(md)).nodes[0]).toEqual(node)
  })

  it.each(['vector<T', 'if a < b', 'x <3', '<a'.repeat(3)])('leaves prose %j alone', async (text) => {
    expect((await renderMarkdown(paragraph(text))).trim()).toBe(text)
  })

  it('keeps a tag-like opener in prose as text through a round-trip', async () => {
    // `<b and c` could open `<b and c>`, so it is escaped, but reads back the same
    const { md, node } = await roundTrip('a <b and c')
    expect(md.trim()).toBe('a \\<b and c')
    expect(node).toEqual(['p', {}, 'a <b and c'])
  })
})

describe('text inside a raw HTML block', () => {
  const block = (tag: string, text: string): MarkdownDocument =>
    ({ frontmatter: {}, meta: {}, nodes: [[tag, { $: { html: 1, block: 1 } }, text]] }) as MarkdownDocument

  // CommonMark renderers parse tags inside an HTML block. The parser keeps
  // some markup as text (an unclosed `<svg>` in `<blockquote>`, the body of
  // `<pre>`), so writing it back verbatim turned text into live markup.
  it.each([
    ['blockquote', "<svg onload=alert('xss')>"],
    ['div', '<img src=x onerror=alert(1)>'],
    ['div', '</div><script>alert(1)</script>'],
    ['div', '<!-- x --><iframe src=x>'],
    ['div', '<?php echo 1 ?>'],
    ['pre', '<img src=x onerror=alert(1)>'],
  ])('<%s> does not write %j back as markup', async (tag, text) => {
    const md = await renderMarkdown(block(tag, text))
    expect(md.slice(`<${tag}>`.length, md.lastIndexOf(`</${tag}>`))).not.toMatch(/<[a-z!/?]/i)
  })

  it.each([
    ['blockquote', "<svg onload=alert('xss')>"],
    ['pre', '<b>bold</b> & a < b'],
    ['div', 'a <b> c'],
  ])('<%s> keeps %j as the same text through a round-trip', async (tag, text) => {
    const document = block(tag, text)
    const md = await renderMarkdown(document)
    const again = await parseMarkdown(md)
    expect(await renderMarkdown(again)).toBe(md)
  })

  it('escapes only the own end tag inside script, style and textarea', async () => {
    expect(await renderMarkdown(block('script', 'if (a < b) x = "</script><img onerror=1>"'))).toBe(
      '<script>\nif (a < b) x = "<\\/script><img onerror=1>"\n</script>'
    )
    expect(await renderMarkdown(block('style', 'a > b {} </STYLE><b>'))).toBe(
      '<style>\na > b {} <\\/STYLE><b>\n</style>'
    )
    expect(await renderMarkdown(block('textarea', '<b></textarea><img onerror=1>'))).toBe(
      '<textarea>\n<b>&lt;/textarea><img onerror=1>\n</textarea>'
    )
  })

  it('keeps markdown syntax, entities and comparisons as written', async () => {
    expect(await renderMarkdown(block('div', 'Hello **World** &amp; a < b, 1<2'))).toBe(
      '<div>\nHello **World** &amp; a < b, 1<2\n</div>'
    )
  })

  it('writes the text verbatim with rawHtmlText: verbatim', async () => {
    expect(await renderMarkdown(block('div', '<b>x</b>'), { rawHtmlText: 'verbatim' })).toBe('<div>\n<b>x</b>\n</div>')
  })
})
