import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { documentToMjmlJson } from '../src/transform.ts'
import { serializeMjml } from '../src/serialize.ts'

describe('documentToMjmlJson', () => {
  it('empty body produces mjml > mj-head + mj-body', async () => {
    const doc = await parseMarkdown('')
    const tree = await documentToMjmlJson(doc)
    expect(tree.tagName).toBe('mjml')
    expect(tree.children?.find((c) => c.tagName === 'mj-head')).toBeDefined()
    expect(tree.children?.find((c) => c.tagName === 'mj-body')).toBeDefined()
  })

  it('heading becomes mj-text with font-size', async () => {
    const doc = await parseMarkdown('# Hello **World**')
    const tree = await documentToMjmlJson(doc)
    const body = tree.children!.find((c) => c.tagName === 'mj-body')!
    const section = body.children![0]
    const column = section.children![0]
    const text = column.children![0]
    expect(text.tagName).toBe('mj-text')
    expect(text.attributes['font-size']).toBe('28px')
    expect(text.content).toContain('<strong>World</strong>')
  })

  it('h2 uses 24px font-size', async () => {
    const doc = await parseMarkdown('## Section')
    const tree = await documentToMjmlJson(doc)
    const body = tree.children!.find((c) => c.tagName === 'mj-body')!
    const text = body.children![0].children![0].children![0]
    expect(text.attributes['font-size']).toBe('24px')
  })

  it('paragraph with emphasis and link becomes mj-text', async () => {
    const doc = await parseMarkdown('Visit [here](https://comark.dev) for _docs_.')
    const tree = await documentToMjmlJson(doc)
    const body = tree.children!.find((c) => c.tagName === 'mj-body')!
    const text = body.children![0].children![0].children![0]
    expect(text.tagName).toBe('mj-text')
    expect(text.content).toContain('<a ')
    expect(text.content).toContain('<em>')
  })

  it('hr becomes mj-divider', async () => {
    const doc = await parseMarkdown('Text\n\n---\n\nMore text')
    const tree = await documentToMjmlJson(doc)
    const body = tree.children!.find((c) => c.tagName === 'mj-body')!
    const column = body.children![0].children![0]
    const divider = column.children!.find((c) => c.tagName === 'mj-divider')
    expect(divider).toBeDefined()
  })

  it('list becomes mj-text with ul/ol html content', async () => {
    const doc = await parseMarkdown('- Item one\n- Item two')
    const tree = await documentToMjmlJson(doc)
    const body = tree.children!.find((c) => c.tagName === 'mj-body')!
    const text = body.children![0].children![0].children![0]
    expect(text.tagName).toBe('mj-text')
    expect(text.content).toContain('<ul')
    expect(text.content).toContain('Item one')
  })

  it('gfm table becomes mj-table', async () => {
    const doc = await parseMarkdown('| A | B |\n|---|---|\n| 1 | 2 |')
    const tree = await documentToMjmlJson(doc)
    const body = tree.children!.find((c) => c.tagName === 'mj-body')!
    const col = body.children![0].children![0]
    const table = col.children!.find((c) => c.tagName === 'mj-table')
    expect(table).toBeDefined()
  })

  it('block image becomes mj-image', async () => {
    const doc = await parseMarkdown('![Logo](https://example.com/logo.png)')
    const tree = await documentToMjmlJson(doc)
    const body = tree.children!.find((c) => c.tagName === 'mj-body')!
    const col = body.children![0].children![0]
    const img = col.children!.find((c) => c.tagName === 'mj-image')
    expect(img).toBeDefined()
    expect(img!.attributes.src).toBe('https://example.com/logo.png')
    expect(img!.attributes.alt).toBe('Logo')
  })

  it('subject becomes mj-title in mj-head', async () => {
    const doc = await parseMarkdown('# Hello')
    const tree = await documentToMjmlJson(doc, { email: { subject: 'My Subject' } })
    const head = tree.children!.find((c) => c.tagName === 'mj-head')!
    const title = head.children!.find((c) => c.tagName === 'mj-title')
    expect(title).toBeDefined()
    expect(title!.content).toBe('My Subject')
  })

  it('previewText becomes mj-preview in mj-head', async () => {
    const doc = await parseMarkdown('# Hi')
    const tree = await documentToMjmlJson(doc, { email: { previewText: 'Preview here' } })
    const head = tree.children!.find((c) => c.tagName === 'mj-head')!
    const preview = head.children!.find((c) => c.tagName === 'mj-preview')
    expect(preview).toBeDefined()
    expect(preview!.content).toBe('Preview here')
  })

  it('brandColor sets mj-button background-color in mj-attributes', async () => {
    const doc = await parseMarkdown('Hello')
    const tree = await documentToMjmlJson(doc, { email: { brandColor: '#0066cc' } })
    const head = tree.children!.find((c) => c.tagName === 'mj-head')!
    const mjAttrs = head.children!.find((c) => c.tagName === 'mj-attributes')!
    const btnAttr = mjAttrs.children!.find((c) => c.tagName === 'mj-button')
    expect(btnAttr).toBeDefined()
    expect(btnAttr!.attributes['background-color']).toBe('#0066cc')
  })

  it('theme.background sets mj-body background-color', async () => {
    const doc = await parseMarkdown('Hello')
    const tree = await documentToMjmlJson(doc, { email: { theme: { background: '#f0f0f0' } } })
    const body = tree.children!.find((c) => c.tagName === 'mj-body')!
    expect(body.attributes['background-color']).toBe('#f0f0f0')
  })

  it('email-columns becomes a sibling mj-section (not nested in default column)', async () => {
    const doc = await parseMarkdown('Intro\n\n::email-columns\nLeft\n\nRight\n::')
    const tree = await documentToMjmlJson(doc)
    const body = tree.children!.find((c) => c.tagName === 'mj-body')!
    expect(body.children).toHaveLength(2)
    expect(body.children![0].tagName).toBe('mj-section')
    expect(body.children![1].tagName).toBe('mj-section')
    // Columns section should have two mj-column children
    expect(body.children![1].children).toHaveLength(2)
    expect(body.children![1].children![0].tagName).toBe('mj-column')
  })

  it('unknown custom component is wrapped in mj-raw', async () => {
    const doc = await parseMarkdown('::note\nHello\n::')
    const tree = await documentToMjmlJson(doc, {
      components: {
        note: ([, , ...children], state) =>
          state.render(children as Parameters<typeof state.render>[0]).then((html: string) => `<aside>${html}</aside>`),
      },
    })
    const body = tree.children!.find((c) => c.tagName === 'mj-body')!
    const col = body.children![0].children![0]
    const raw = col.children!.find((c) => c.tagName === 'mj-raw')
    expect(raw).toBeDefined()
    expect(raw!.content).toContain('<aside>')
  })
})

describe('serializeMjml', () => {
  it('serializes a leaf node without children', () => {
    const xml = serializeMjml({ tagName: 'mj-divider', attributes: { 'border-color': '#ccc' } })
    expect(xml).toBe('<mj-divider border-color="#ccc" />')
  })

  it('serializes a node with content inline', () => {
    const xml = serializeMjml({ tagName: 'mj-title', attributes: {}, content: 'Hello' })
    expect(xml).toBe('<mj-title>Hello</mj-title>')
  })

  it('escapes attribute values', () => {
    const xml = serializeMjml({ tagName: 'mj-text', attributes: { style: 'color:"red"' }, content: 'hi' })
    expect(xml).toContain('&quot;red&quot;')
  })

  it('produces a full mjml document string', async () => {
    const doc = await parseMarkdown('# Title')
    const tree = await documentToMjmlJson(doc, { email: { subject: 'Test' } })
    const xml = serializeMjml(tree)
    expect(xml).toContain('<mjml>')
    expect(xml).toContain('<mj-title>Test</mj-title>')
    expect(xml).toContain('mj-body')
  })
})
