import { describe, expect, it } from 'vitest'
import { createMarkdownParser, parseMarkdown } from '../src/parse'
import security from '../src/plugins/security'
import { renderMarkdown, resolveAttributes } from '../src/render'
import type { ElementNode } from '../src/types'

/**
 * SVG/MathML foreign content is case-sensitive. Element names get their
 * SVG/MathML case from the HTML standard's adjustment rules, and attribute
 * names keep the author's case. HTML names outside stay lowercase (#467).
 */

describe('SVG case preservation', () => {
  it('preserves SVG element and attribute names in inline HTML', async () => {
    const result = await parseMarkdown('<svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>')
    expect(result.nodes).toEqual([
      [
        'p',
        {},
        [
          'svg',
          { $: { html: 1, block: 0 }, viewBox: '0 0 10 10' },
          ['linearGradient', { $: { html: 1, block: 0 }, id: 'g' }],
        ],
      ],
    ])
  })

  it('preserves SVG element and attribute names in HTML blocks', async () => {
    const result = await parseMarkdown('<svg viewBox="0 0 10 10">\n  <linearGradient id="g"></linearGradient>\n</svg>')
    expect(result.nodes).toEqual([
      [
        'svg',
        { $: { html: 1, block: 1 }, viewBox: '0 0 10 10' },
        ['linearGradient', { $: { html: 1, block: 1 }, id: 'g' }],
      ],
    ])
  })

  it('adjusts wrongly-cased SVG tag names in inline HTML via the HTML standard rules', async () => {
    // Authors write the element name wrong; the foreign-content adjustment
    // tables (applied by htmlparser2 inside a synthetic <svg> wrapper) fix it.
    const result = await parseMarkdown('<svg><LINEARGRADIENT X1="0"></LINEARGRADIENT></svg>')
    expect(result.nodes).toEqual([
      ['p', {}, ['svg', { $: { html: 1, block: 0 } }, ['linearGradient', { $: { html: 1, block: 0 }, X1: '0' }]]],
    ])
  })

  it('adjusts wrongly-cased SVG tag names in HTML blocks', async () => {
    const result = await parseMarkdown('<svg>\n<LINEARGRADIENT X1="0">\n</LINEARGRADIENT>\n</svg>')
    expect(result.nodes).toEqual([
      ['svg', { $: { html: 1, block: 1 } }, ['linearGradient', { $: { html: 1, block: 1 }, X1: '0' }]],
    ])
  })

  it('keeps SVG siblings flat when children are self-closed inline', async () => {
    // Regression: <path/> used to open a subtree that swallowed <circle/>.
    const result = await parseMarkdown('<svg viewBox="0 0 1 1"><path d="M0 0"/><circle r="1"/></svg>')
    expect(result.nodes).toEqual([
      [
        'p',
        {},
        [
          'svg',
          { $: { html: 1, block: 0 }, viewBox: '0 0 1 1' },
          ['path', { $: { html: 1, block: 0 }, d: 'M0 0' }],
          ['circle', { $: { html: 1, block: 0 }, r: '1' }],
        ],
      ],
    ])
  })

  it('keeps SVG siblings flat when children are self-closed in blocks', async () => {
    const result = await parseMarkdown('<svg>\n  <path d="M0 0"/>\n  <circle r="1"/>\n</svg>')
    expect(result.nodes).toEqual([
      [
        'svg',
        { $: { html: 1, block: 1 } },
        ['path', { $: { html: 1, block: 1 }, d: 'M0 0' }],
        ['circle', { $: { html: 1, block: 1 }, r: '1' }],
      ],
    ])
  })

  it('treats a self-closed <svg/> root as void and keeps following text outside', async () => {
    const result = await parseMarkdown('a <svg viewBox="0 0 1 1"/> b')
    expect(result.nodes).toEqual([['p', {}, 'a ', ['svg', { $: { html: 1, block: 0 }, viewBox: '0 0 1 1' }], ' b']])
  })

  it('treats a self-closed <math/> root as void and keeps following text outside', async () => {
    const result = await parseMarkdown('<math/> after')
    expect(result.nodes).toEqual([['p', {}, ['math', { $: { html: 1, block: 0 } }], ' after']])
  })

  it('does not change void handling for HTML elements outside SVG', async () => {
    // htmlparser2 closes some legacy HTML elements at once (keygen, frame).
    // Inline HTML outside foreign content keeps the VOID_ELEMENTS rule.
    const result = await parseMarkdown('a <keygen>b</keygen> c')
    expect(result.nodes).toEqual([['p', {}, 'a ', ['keygen', { $: { html: 1, block: 0 } }, 'b'], ' c']])
  })

  it('still ignores the self-closing flag for HTML elements', async () => {
    // Per HTML, <div/> does not close the element; children run to </div>.
    const result = await parseMarkdown('<div/>x</div>')
    expect(result.nodes).toEqual([['div', { $: { html: 1, block: 1 } }, 'x']])
  })

  it('still ignores the self-closing flag for inline HTML elements', async () => {
    const result = await parseMarkdown('a <span/>b</span> c')
    expect(result.nodes).toEqual([['p', {}, 'a ', ['span', { $: { html: 1, block: 0 } }, 'b'], ' c']])
  })

  it('lowercases HTML element and attribute names outside SVG (inline)', async () => {
    const result = await parseMarkdown('<Hello CLASS="x" DATA-Foo="1">World</Hello>')
    expect(result.nodes).toEqual([
      ['p', {}, ['hello', { $: { html: 1, block: 0 }, class: 'x', 'data-foo': '1' }, 'World']],
    ])
  })

  it('lowercases HTML element and attribute names outside SVG (block)', async () => {
    const result = await parseMarkdown('<Hello CLASS="x">\nWorld\n</Hello>')
    expect(result.nodes).toEqual([['hello', { $: { html: 1, block: 1 }, class: 'x' }, 'World']])
  })

  it('lowercases an uppercase SVG opener but keeps foreign-content casing', async () => {
    // <SVG> is an HTML-parsed start tag, so it is lowercased. ClipPath is
    // wrongly cased and normalized to the SVG name by the adjustment rules.
    const result = await parseMarkdown('<SVG><ClipPath ID="c"></ClipPath></SVG>')
    expect(result.nodes).toEqual([
      ['p', {}, ['svg', { $: { html: 1, block: 0 } }, ['clipPath', { $: { html: 1, block: 0 }, ID: 'c' }]]],
    ])
  })

  it('preserves casing inside MathML content and adjusts wrongly-cased names', async () => {
    const result = await parseMarkdown('<math displayStyle="true"><MROW></MROW></math>')
    expect(result.nodes).toEqual([
      ['p', {}, ['math', { $: { html: 1, block: 0 }, displayStyle: 'true' }, ['mrow', { $: { html: 1, block: 0 } }]]],
    ])
  })

  it('keeps siblings after the closing tag of a camelCase SVG element (inline)', async () => {
    // The close fast path lowercases `</linearGradient>`. The opener keeps
    // `linearGradient`. The match must ignore case, or <circle/> becomes a
    // child of <linearGradient>. The sibling is what makes a mismatch
    // visible: an unmatched close is skipped as an orphan.
    const result = await parseMarkdown('<svg><linearGradient id="g"></linearGradient><circle r="1"/></svg> after')
    expect(result.nodes).toEqual([
      [
        'p',
        {},
        [
          'svg',
          { $: { html: 1, block: 0 } },
          ['linearGradient', { $: { html: 1, block: 0 }, id: 'g' }],
          ['circle', { $: { html: 1, block: 0 }, r: '1' }],
        ],
        ' after',
      ],
    ])
  })

  it('matches closing tags case-insensitively (inline)', async () => {
    const result = await parseMarkdown(
      '<svg viewBox="0 0 1 1"><linearGradient id="g"></LINEARGRADIENT><circle r="1"/></svg> after'
    )
    expect(result.nodes).toEqual([
      [
        'p',
        {},
        [
          'svg',
          { $: { html: 1, block: 0 }, viewBox: '0 0 1 1' },
          ['linearGradient', { $: { html: 1, block: 0 }, id: 'g' }],
          ['circle', { $: { html: 1, block: 0 }, r: '1' }],
        ],
        ' after',
      ],
    ])
  })

  it('matches closing tags case-insensitively (block)', async () => {
    const result = await parseMarkdown('<svg>\n<linearGradient id="g">\n</LINEARGRADIENT>\n<circle r="1"/>\n</svg>')
    expect(result.nodes).toEqual([
      [
        'svg',
        { $: { html: 1, block: 1 } },
        ['linearGradient', { $: { html: 1, block: 1 }, id: 'g' }],
        ['circle', { $: { html: 1, block: 1 }, r: '1' }],
      ],
    ])
  })

  it('keeps author attribute casing for HTML inside foreignObject (documented trade-off)', async () => {
    // The parser does not model foreignObject as an HTML integration point.
    // The whole SVG subtree keeps the author's attribute case. The DOM
    // ignores attribute case on HTML elements, and the renderer floor drops
    // DOM property sinks (see the outerHTML test).
    const result = await parseMarkdown('<svg>\n  <foreignObject><div CLASS="x">hi</div></foreignObject>\n</svg>')
    expect(result.nodes).toEqual([
      [
        'svg',
        { $: { html: 1, block: 1 } },
        ['foreignObject', { $: { html: 1, block: 1 } }, ['div', { $: { html: 1, block: 1 }, CLASS: 'x' }, 'hi']],
      ],
    ])
  })

  it('swallows the rest of the paragraph into an unclosed inline SVG', async () => {
    // An unclosed <svg> has no end tag to stop the lookahead, so the
    // remaining inline tokens become its children. No crash, casing kept.
    const result = await parseMarkdown('text <svg viewBox="0 0 1 1"> more text')
    expect(result.nodes).toEqual([
      ['p', {}, 'text ', ['svg', { $: { html: 1, block: 0 }, viewBox: '0 0 1 1' }, ' more text']],
    ])
  })

  it('handles SVG with self-closing children inside headings', async () => {
    const result = await parseMarkdown('# T <svg viewBox="0 0 1 1"><path d="M0 0"/></svg>')
    expect(result.nodes).toEqual([
      [
        'h1',
        { id: 't' },
        'T ',
        ['svg', { $: { html: 1, block: 0 }, viewBox: '0 0 1 1' }, ['path', { $: { html: 1, block: 0 }, d: 'M0 0' }]],
      ],
    ])
  })

  it('keeps markdown inline parsing inside SVG text children', async () => {
    const result = await parseMarkdown('<svg><text>Hi **bold**</text></svg>')
    expect(result.nodes).toEqual([
      [
        'p',
        {},
        ['svg', { $: { html: 1, block: 0 } }, ['text', { $: { html: 1, block: 0 } }, 'Hi ', ['strong', {}, 'bold']]],
      ],
    ])
  })

  it('preserves casing when parsing with streaming enabled', async () => {
    // The incomplete <linearGradient> opener is dropped by auto-close (its
    // own documented behavior for trailing openers); the completed <svg>
    // keeps its casing and does not crash.
    const result = await createMarkdownParser()('<svg viewBox="0 0 10 10"><linearGradient id="g"', { streaming: true })
    expect(result.nodes).toEqual([['svg', { $: { html: 1, block: 1 }, viewBox: '0 0 10 10' }]])
  })

  it('does not treat an unquoted attribute value ending in "/" as self-closing', async () => {
    // In `href=/x/>` the slash belongs to the unquoted value. The tag is not
    // self-closed, so `link` stays inside the <a> element.
    const result = await parseMarkdown('<svg><a href=/x/>link</a></svg>')
    expect(result.nodes).toEqual([
      ['p', {}, ['svg', { $: { html: 1, block: 0 } }, ['a', { $: { html: 1, block: 0 }, href: '/x/' }, 'link']]],
    ])
  })

  it('keeps the first of case-variant duplicate attributes on HTML elements', async () => {
    // Browsers keep the first `href`. If the last one won, a later `HREF`
    // could replace a value that a sanitizer already checked.
    const result = await parseMarkdown('<a href="/safe" HREF="javascript:alert(1)">x</a>')
    expect(result.nodes).toEqual([['p', {}, ['a', { $: { html: 1, block: 0 }, href: '/safe' }, 'x']]])
  })

  it('keeps the first of case-variant duplicate attributes in HTML blocks', async () => {
    const result = await parseMarkdown('<div title="first" TITLE="second">\nx\n</div>')
    expect(result.nodes).toEqual([['div', { $: { html: 1, block: 1 }, title: 'first' }, 'x']])
  })

  it('keeps the first of case-variant duplicate attributes inside SVG', async () => {
    const result = await parseMarkdown('<svg viewBox="0 0 1 1" viewbox="9 9 9 9"></svg>')
    expect(result.nodes).toEqual([['p', {}, ['svg', { $: { html: 1, block: 0 }, viewBox: '0 0 1 1' }]]])
  })

  it('matches hyphenated closing tags of custom elements', async () => {
    const result = await parseMarkdown('<my-el>x</my-el> after')
    expect(result.nodes).toEqual([['p', {}, ['my-el', { $: { html: 1, block: 0 } }, 'x'], ' after']])
  })

  it('matches hyphenated closing tags in MathML (annotation-xml)', async () => {
    const result = await parseMarkdown('<math><annotation-xml encoding="text/html">y</annotation-xml> z</math>')
    expect(result.nodes).toEqual([
      [
        'p',
        {},
        [
          'math',
          { $: { html: 1, block: 0 } },
          ['annotation-xml', { $: { html: 1, block: 0 }, encoding: 'text/html' }, 'y'],
          ' z',
        ],
      ],
    ])
  })

  it('does not forward DOM property sinks from foreign content to renderers', async () => {
    // SVG subtrees keep attribute case, so `outerHTML` no longer becomes an
    // inert `outerhtml`. Vue sets `outerHTML` as a DOM property on HTML
    // elements inside foreignObject, so the renderer floor must drop it.
    const result = await parseMarkdown(
      '<svg><foreignObject><div outerHTML="<img src=x onerror=alert(1)>" title="t"></div></foreignObject></svg>'
    )
    const p = result.nodes[0] as ElementNode
    const svg = p[2] as ElementNode
    const foreignObject = svg[2] as ElementNode
    const div = foreignObject[2] as ElementNode
    expect(div[0]).toBe('div')
    const renderData = { frontmatter: {}, meta: {}, data: {}, props: {} }
    expect(resolveAttributes(div[1], renderData, { parseJson: true })).toEqual({ title: 't' })
  })

  it('drops DOM property sinks inside SVG with the security plugin', async () => {
    const result = await parseMarkdown('<svg outerHTML="<img src=x onerror=alert(1)>" viewBox="0 0 1 1"></svg>', {
      plugins: [security()],
    })
    expect(result.nodes).toEqual([['p', {}, ['svg', { $: { html: 1, block: 0 }, viewBox: '0 0 1 1' }]]])
  })

  it('round-trips SVG casing through renderMarkdown (inline)', async () => {
    const markdown = '<svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>'
    const document = await parseMarkdown(markdown)
    const output = await renderMarkdown(document)
    // Assert the output text: a fixed-point check alone also passes when
    // both parses lowercase the names.
    expect(output.trim()).toBe(markdown)
    const reparsed = await parseMarkdown(output)
    expect(reparsed.nodes).toEqual(document.nodes)
  })

  it('round-trips SVG casing through renderMarkdown (block)', async () => {
    const markdown = '<svg viewBox="0 0 10 10">\n<linearGradient id="g"></linearGradient>\n</svg>'
    const document = await parseMarkdown(markdown)
    const output = await renderMarkdown(document)
    expect(output.trim()).toBe(markdown)
    const reparsed = await parseMarkdown(output)
    expect(reparsed.nodes).toEqual(document.nodes)
  })
})
