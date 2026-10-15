import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse'
import security from '../src/plugins/security'
import { renderMarkdown, resolveAttributes } from '../src/render'
import type { ElementNode, Node } from '../src/types'

/**
 * Tag and attribute names share one rule: an all-uppercase name is lowercased
 * (`DIV`, `HREF`), any other name keeps the author's case. That keeps SVG and
 * MathML names (`viewBox`, `linearGradient`) and component props (`someProp`)
 * intact (#467).
 *
 * `stripMeta` drops the `$` metadata and `findElement` skips paragraph
 * wrappers, so these tests check names and attributes, not tree layout.
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

describe('HTML name case', () => {
  it.each([
    ['inline', 'x <svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>'],
    ['block', '<svg viewBox="0 0 10 10">\n  <linearGradient id="g"></linearGradient>\n</svg>'],
  ])('keeps SVG element and attribute names (%s)', async (_, markdown) => {
    expect(await parseElement(markdown, 'svg')).toEqual([
      'svg',
      { viewBox: '0 0 10 10' },
      ['linearGradient', { id: 'g' }],
    ])
  })

  it('keeps SVG animation attribute names', async () => {
    expect(
      await parseElement('<svg><animate attributeName="opacity" repeatCount="indefinite"/></svg>', 'animate')
    ).toEqual(['animate', { attributeName: 'opacity', repeatCount: 'indefinite' }])
  })

  it('keeps MathML attribute names', async () => {
    expect(await parseElement('<math displayStyle="true"><mrow></mrow></math>', 'math')).toEqual([
      'math',
      { displayStyle: 'true' },
      ['mrow', {}],
    ])
  })

  it('keeps camelCase props on components', async () => {
    expect(await parseElement('<MyCard someProp="x" CLASS="c">hi</MyCard>', 'MyCard')).toEqual([
      'MyCard',
      { someProp: 'x', class: 'c' },
      'hi',
    ])
  })

  it.each([
    ['inline', 'x <DIV CLASS="x" DATA-FOO="1">World</DIV>'],
    ['block', '<DIV CLASS="x" DATA-FOO="1">\nWorld\n</DIV>'],
  ])('lowercases all-uppercase names (%s)', async (_, markdown) => {
    expect(await parseElement(markdown, 'div')).toEqual(['div', { class: 'x', 'data-foo': '1' }, 'World'])
  })

  it('lowercases an all-uppercase SVG name (no SVG name table)', async () => {
    expect(await parseElement('<SVG VIEWBOX="0 0 1 1"><LINEARGRADIENT></LINEARGRADIENT></SVG>', 'svg')).toEqual([
      'svg',
      { viewbox: '0 0 1 1' },
      ['lineargradient', {}],
    ])
  })

  it('matches the closing tag of a camelCase element case-insensitively', async () => {
    // A mismatched close would leave <circle/> inside <linearGradient>.
    expect(await parseElement('<svg><linearGradient id="g"></LINEARGRADIENT><circle r="1"/></svg>', 'svg')).toEqual([
      'svg',
      {},
      ['linearGradient', { id: 'g' }],
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
})

describe('security with case-preserved names', () => {
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
    ['Href with javascript:', '<svg viewBox="0 0 1 1"><a Href="javascript:alert(1)"></a></svg>'],
  ])('drops case-preserved %s with the security plugin', async (_, markdown) => {
    const { nodes } = await parseMarkdown(markdown, { plugins: [security()] })
    const svg = stripMeta(findElement(nodes, 'svg')!) as ElementNode
    expect(svg[1]).toEqual({ viewBox: '0 0 1 1' })
    if (svg[2]) expect((svg[2] as ElementNode)[1]).toEqual({})
  })
})

describe('round trip', () => {
  it.each([
    ['inline', 'x <svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>'],
    ['block', '<svg viewBox="0 0 10 10">\n<linearGradient id="g"></linearGradient>\n</svg>'],
  ])('keeps SVG casing through renderMarkdown (%s)', async (_, markdown) => {
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
