import { describe, expect, it } from 'vitest'
import { createMarkdownParser, parseMarkdown } from '../src/parse'
import security from '../src/plugins/security'
import { renderMarkdown, resolveAttributes } from '../src/render'
import type { ElementNode, Node } from '../src/types'

/**
 * SVG/MathML foreign content is case-sensitive. Element names get their
 * SVG/MathML case from the HTML standard's adjustment rules, and attribute
 * names keep the author's case. HTML names outside stay lowercase (#467).
 *
 * These tests check names, attributes and nesting only. `stripMeta` drops the
 * `$` position/html metadata and `findElement` skips paragraph wrappers, so the
 * assertions do not depend on how the tree builder groups HTML into blocks.
 */

function stripMeta(node: Node): unknown {
  if (!Array.isArray(node) || node[0] === null) return node
  const [tag, attrs, ...children] = node as ElementNode
  const { $: _meta, ...rest } = attrs as Record<string, unknown>
  return [tag, rest, ...children.map(stripMeta)]
}

function findElement(nodes: Node[], tag: string): ElementNode | undefined {
  for (const node of nodes) {
    if (!Array.isArray(node) || node[0] === null) continue
    if (node[0] === tag) return node as ElementNode
    const found = findElement(node.slice(2) as Node[], tag)
    if (found) return found
  }
  return undefined
}

async function parseElement(markdown: string, tag: string): Promise<unknown> {
  const { nodes } = await parseMarkdown(markdown)
  const element = findElement(nodes, tag)
  expect(element, `expected a <${tag}> element in ${JSON.stringify(nodes)}`).toBeDefined()
  return stripMeta(element!)
}

describe('SVG case preservation', () => {
  it.each([
    ['inline', '<svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>'],
    ['block', '<svg viewBox="0 0 10 10">\n  <linearGradient id="g"></linearGradient>\n</svg>'],
  ])('preserves SVG element and attribute names (%s)', async (_, markdown) => {
    expect(await parseElement(markdown, 'svg')).toEqual([
      'svg',
      { viewBox: '0 0 10 10' },
      ['linearGradient', { id: 'g' }],
    ])
  })

  it.each([
    ['inline', '<svg><LINEARGRADIENT X1="0"></LINEARGRADIENT></svg>'],
    ['block', '<svg>\n<LINEARGRADIENT X1="0">\n</LINEARGRADIENT>\n</svg>'],
  ])('adjusts wrongly-cased SVG tag names via the HTML standard rules (%s)', async (_, markdown) => {
    expect(await parseElement(markdown, 'svg')).toEqual(['svg', {}, ['linearGradient', { X1: '0' }]])
  })

  it.each([
    ['inline', '<svg viewBox="0 0 1 1"><path d="M0 0"/><circle r="1"/></svg>'],
    ['block', '<svg viewBox="0 0 1 1">\n  <path d="M0 0"/>\n  <circle r="1"/>\n</svg>'],
  ])('keeps SVG siblings flat when children are self-closed (%s)', async (_, markdown) => {
    expect(await parseElement(markdown, 'svg')).toEqual([
      'svg',
      { viewBox: '0 0 1 1' },
      ['path', { d: 'M0 0' }],
      ['circle', { r: '1' }],
    ])
  })

  it('treats a self-closed <svg/> root as void and keeps following text outside', async () => {
    const { nodes } = await parseMarkdown('a <svg viewBox="0 0 1 1"/> b')
    expect(nodes.map(stripMeta)).toEqual([['p', {}, 'a ', ['svg', { viewBox: '0 0 1 1' }], ' b']])
  })

  it('treats a self-closed <math/> root as void and keeps following text outside', async () => {
    const { nodes } = await parseMarkdown('<math/> after')
    expect(nodes.map(stripMeta)).toEqual([['p', {}, ['math', {}], ' after']])
  })

  it.each([
    ['inline', 'x <Div CLASS="x" DATA-Foo="1">World</Div>'],
    ['block', '<DIV CLASS="x" DATA-Foo="1">\nWorld\n</DIV>'],
  ])('lowercases HTML attribute names outside SVG (%s)', async (_, markdown) => {
    const { nodes } = await parseMarkdown(markdown)
    const element = nodes.flatMap((n) => (Array.isArray(n) && n[0] === 'p' ? n.slice(2) : [n]))
    const div = element.find((n) => Array.isArray(n) && typeof n[0] === 'string' && n[0].toLowerCase() === 'div')
    expect((stripMeta(div as Node) as ElementNode)[1]).toEqual({ class: 'x', 'data-foo': '1' })
  })

  it('lowercases an uppercase SVG opener but keeps foreign-content casing', async () => {
    // <SVG> is an HTML-parsed start tag, so it is lowercased. ClipPath is
    // wrongly cased and normalized to the SVG name by the adjustment rules.
    expect(await parseElement('<SVG><ClipPath ID="c"></ClipPath></SVG>', 'svg')).toEqual([
      'svg',
      {},
      ['clipPath', { ID: 'c' }],
    ])
  })

  it('preserves casing inside MathML content and adjusts wrongly-cased names', async () => {
    expect(await parseElement('<math displayStyle="true"><MROW></MROW></math>', 'math')).toEqual([
      'math',
      { displayStyle: 'true' },
      ['mrow', {}],
    ])
  })

  it.each([
    ['same case', '<svg><linearGradient id="g"></linearGradient><circle r="1"/></svg> after'],
    ['inline, different case', '<svg><linearGradient id="g"></LINEARGRADIENT><circle r="1"/></svg> after'],
    ['block, different case', '<svg>\n<linearGradient id="g">\n</LINEARGRADIENT>\n<circle r="1"/>\n</svg>'],
  ])('matches the closing tag of a camelCase SVG element (%s)', async (_, markdown) => {
    // A mismatched close would leave <circle/> inside <linearGradient>.
    expect(await parseElement(markdown, 'svg')).toEqual([
      'svg',
      {},
      ['linearGradient', { id: 'g' }],
      ['circle', { r: '1' }],
    ])
  })

  it.each([
    ['foreignObject', '<svg><foreignObject><div CLASS="x">hi</div></foreignObject></svg>'],
    ['desc', '<svg><desc><span CLASS="x">hi</span></desc></svg>'],
    ['title', '<svg><title><span CLASS="x">hi</span></title></svg>'],
    [
      'annotation-xml (text/html)',
      '<math><annotation-xml encoding="text/html"><span CLASS="x">hi</span></annotation-xml></math>',
    ],
  ])('parses HTML inside %s as HTML again (lowercase attributes)', async (tag, markdown) => {
    const parent = await parseElement(markdown, tag.split(' ')[0])
    expect((parent as ElementNode[])[2][1]).toEqual({ class: 'x' })
  })

  it('keeps foreign casing inside annotation-xml without an HTML encoding', async () => {
    const element = await parseElement(
      '<math><annotation-xml encoding="application/mathml+xml"><mi mathVariant="bold">x</mi></annotation-xml></math>',
      'mi'
    )
    expect(element).toEqual(['mi', { mathVariant: 'bold' }, 'x'])
  })

  it('swallows the rest of the paragraph into an unclosed inline SVG', async () => {
    expect(await parseElement('text <svg viewBox="0 0 1 1"> more text', 'svg')).toEqual([
      'svg',
      { viewBox: '0 0 1 1' },
      ' more text',
    ])
  })

  it('nests SVG children inside headings', async () => {
    const { nodes } = await parseMarkdown('# T <svg viewBox="0 0 1 1"><path d="M0 0"/></svg>')
    expect(nodes.map(stripMeta)).toEqual([
      ['h1', { id: 't' }, 'T ', ['svg', { viewBox: '0 0 1 1' }, ['path', { d: 'M0 0' }]]],
    ])
  })

  it('keeps markdown inline parsing inside SVG text children', async () => {
    expect(await parseElement('<svg><text>Hi **bold**</text></svg>', 'svg')).toEqual([
      'svg',
      {},
      ['text', {}, 'Hi ', ['strong', {}, 'bold']],
    ])
  })

  it('preserves casing when parsing with streaming enabled', async () => {
    // The incomplete <linearGradient> opener is dropped by auto-close (its
    // own documented behavior for trailing openers); the completed <svg>
    // keeps its casing and does not crash.
    const result = await createMarkdownParser()('<svg viewBox="0 0 10 10"><linearGradient id="g"', { streaming: true })
    expect(stripMeta(findElement(result.nodes, 'svg')!)).toEqual(['svg', { viewBox: '0 0 10 10' }])
  })

  it.each([
    ['inside SVG', '<svg><a href=/x/>link</a></svg>'],
    ['outside SVG', 'x <a href=/x/>link</a> y'],
  ])('does not treat an unquoted attribute value ending in "/" as self-closing (%s)', async (_, markdown) => {
    // In `href=/x/>` the slash belongs to the unquoted value.
    expect(await parseElement(markdown, 'a')).toEqual(['a', { href: '/x/' }, 'link'])
  })

  it('still self-closes after a bare attribute name or whitespace', async () => {
    expect(await parseElement('<svg><path d="M0 0" hidden/><circle r=1 /></svg>', 'svg')).toEqual([
      'svg',
      {},
      ['path', { d: 'M0 0', hidden: true }],
      ['circle', { r: '1' }],
    ])
  })

  it.each([
    ['inline HTML', 'x <a href="/safe" HREF="javascript:alert(1)">x</a>', 'a', { href: '/safe' }],
    ['HTML block', '<div title="first" TITLE="second">\nx\n</div>', 'div', { title: 'first' }],
    ['SVG', '<svg viewBox="0 0 1 1" viewbox="9 9 9 9"></svg>', 'svg', { viewBox: '0 0 1 1' }],
  ])('keeps the first of case-variant duplicate attributes (%s)', async (_, markdown, tag, attrs) => {
    // Browsers keep the first one. If the last won, a later `HREF` could
    // replace a value that a sanitizer already checked.
    expect(((await parseElement(markdown, tag)) as ElementNode)[1]).toEqual(attrs)
  })

  it('matches hyphenated closing tags of custom elements', async () => {
    const { nodes } = await parseMarkdown('<my-el>x</my-el> after')
    expect(nodes.map(stripMeta)).toEqual([['p', {}, ['my-el', {}, 'x'], ' after']])
  })

  it('matches hyphenated closing tags in MathML (annotation-xml)', async () => {
    expect(
      await parseElement('<math><annotation-xml encoding="text/html">y</annotation-xml> z</math>', 'math')
    ).toEqual(['math', {}, ['annotation-xml', { encoding: 'text/html' }, 'y'], ' z'])
  })

  it('does not forward DOM property sinks to renderers', async () => {
    // Vue sets `outerHTML` as a DOM property, so the renderer floor drops it
    // whatever its case.
    const { nodes } = await parseMarkdown('<svg outerHTML="<img src=x onerror=alert(1)>" title="t"></svg>')
    const svg = findElement(nodes, 'svg')!
    expect(svg[1].outerHTML).toBeDefined()
    const renderData = { frontmatter: {}, meta: {}, data: {}, props: {} }
    expect(resolveAttributes(svg[1], renderData, { parseJson: true })).toEqual({ title: 't' })
  })

  it.each([
    ['outerHTML', '<svg outerHTML="<img src=x onerror=alert(1)>" viewBox="0 0 1 1"></svg>'],
    ['onLoad', '<svg onLoad="alert(1)" viewBox="0 0 1 1"></svg>'],
    ['onClick on a child', '<svg viewBox="0 0 1 1"><circle onClick="alert(1)"/></svg>'],
  ])('drops case-preserved %s inside SVG with the security plugin', async (_, markdown) => {
    const { nodes } = await parseMarkdown(markdown, { plugins: [security()] })
    const svg = stripMeta(findElement(nodes, 'svg')!) as ElementNode
    expect(svg[1]).toEqual({ viewBox: '0 0 1 1' })
    if (svg[2]) expect((svg[2] as ElementNode)[1]).toEqual({})
  })

  it.each([
    ['inline', 'x <svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>'],
    ['block', '<svg viewBox="0 0 10 10">\n<linearGradient id="g"></linearGradient>\n</svg>'],
  ])('round-trips SVG casing through renderMarkdown (%s)', async (_, markdown) => {
    const document = await parseMarkdown(markdown)
    const output = await renderMarkdown(document)
    // Check the text: a fixed-point check alone also passes when both
    // parses lowercase the names.
    expect(output).toContain('viewBox="0 0 10 10"')
    expect(output).toContain('<linearGradient id="g"></linearGradient>')
    const reparsed = await parseMarkdown(output)
    expect(reparsed.nodes).toEqual(document.nodes)
  })
})
