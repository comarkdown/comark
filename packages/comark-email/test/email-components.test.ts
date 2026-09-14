import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { emailButtonToMjml } from '../src/plugins/email-button.ts'
import { emailColumnsToMjml } from '../src/plugins/email-columns.ts'
import { emailDividerToMjml } from '../src/plugins/email-divider.ts'
import { documentToMjmlJson } from '../src/transform.ts'
import { serializeMjml } from '../src/serialize.ts'

// ─── AST parsing ─────────────────────────────────────────────────────────────

describe('::email-button AST', () => {
  it('parses ::email-button to [email-button, {}] node', async () => {
    const doc = await parseMarkdown('::email-button\nClick\n::')
    const node = doc.nodes[0] as [string, Record<string, unknown>, ...unknown[]]
    expect(node[0]).toBe('email-button')
    expect(node[1]).toEqual({})
  })

  it('parses ::email-button with href and background-color', async () => {
    const doc = await parseMarkdown('::email-button{href="https://example.com" background-color="#0066cc"}\nClick\n::')
    const node = doc.nodes[0] as [string, Record<string, unknown>, ...unknown[]]
    expect(node[0]).toBe('email-button')
    expect(node[1]).toMatchObject({ href: 'https://example.com', 'background-color': '#0066cc' })
  })
})

describe('emailButtonToMjml', () => {
  it('emits an mj-button with href', async () => {
    const mjml = await emailButtonToMjml(['email-button', { href: 'https://example.com' }])
    expect(mjml.tagName).toBe('mj-button')
    expect(mjml.attributes.href).toBe('https://example.com')
  })

  it('defaults href to # when missing', async () => {
    const mjml = await emailButtonToMjml(['email-button', {}])
    expect(mjml.attributes.href).toBe('#')
  })

  it('passes through background-color', async () => {
    const mjml = await emailButtonToMjml(['email-button', { 'background-color': '#0066cc' }])
    expect(mjml.attributes['background-color']).toBe('#0066cc')
  })

  it('maps class to css-class', async () => {
    const mjml = await emailButtonToMjml(['email-button', { class: 'my-btn' }])
    expect(mjml.attributes['css-class']).toBe('my-btn')
    expect(mjml.attributes['class']).toBeUndefined()
  })

  it('renders children as button content', async () => {
    const doc = await parseMarkdown('::email-button{href="#"}\n**Click**\n::')
    const node = doc.nodes[0] as [string, Record<string, unknown>]
    const mjml = await emailButtonToMjml(node)
    expect(mjml.content).toContain('<strong>')
  })
})

describe('::email-columns AST', () => {
  it('parses ::email-columns to [email-columns, {}] node', async () => {
    const doc = await parseMarkdown('::email-columns\nLeft\n\nRight\n::')
    const node = doc.nodes[0] as [string, Record<string, unknown>, ...unknown[]]
    expect(node[0]).toBe('email-columns')
    expect(node[1]).toEqual({})
  })
})

describe('emailColumnsToMjml', () => {
  it('emits mj-section', async () => {
    const mjml = await emailColumnsToMjml(['email-columns', {}], async () => [])
    expect(mjml.tagName).toBe('mj-section')
  })

  it('creates one mj-column per child', async () => {
    const mjml = await emailColumnsToMjml(
      ['email-columns', {}, 'Left', 'Right'] as [string, Record<string, unknown>, ...import('comark').Node[]],
      async () => []
    )
    expect(mjml.children).toHaveLength(2)
    expect(mjml.children![0].tagName).toBe('mj-column')
    expect(mjml.children![1].tagName).toBe('mj-column')
  })

  it('passes background-color to the section', async () => {
    const mjml = await emailColumnsToMjml(['email-columns', { 'background-color': '#eee' }], async () => [])
    expect(mjml.attributes['background-color']).toBe('#eee')
  })
})

describe('::email-divider AST', () => {
  it('parses ::email-divider to [email-divider, {}] node', async () => {
    const doc = await parseMarkdown('::email-divider\n::')
    const node = doc.nodes[0] as [string, Record<string, unknown>, ...unknown[]]
    expect(node[0]).toBe('email-divider')
    expect(node[1]).toEqual({})
  })
})

describe('emailDividerToMjml', () => {
  it('emits mj-divider', () => {
    const mjml = emailDividerToMjml(['email-divider', {}])
    expect(mjml.tagName).toBe('mj-divider')
  })

  it('passes border-color through', () => {
    const mjml = emailDividerToMjml(['email-divider', { 'border-color': '#ccc' }])
    expect(mjml.attributes['border-color']).toBe('#ccc')
  })

  it('maps class to css-class', () => {
    const mjml = emailDividerToMjml(['email-divider', { class: 'my-divider' }])
    expect(mjml.attributes['css-class']).toBe('my-divider')
  })
})

// ─── Full document integration ────────────────────────────────────────────────

describe('documentToMjmlJson with email components', () => {
  it('email-button appears as mj-button (not inside mj-text)', async () => {
    const doc = await parseMarkdown('::email-button{href="https://example.com"}\nClick\n::')
    const xml = serializeMjml(await documentToMjmlJson(doc))
    expect(xml).toContain('<mj-button')
    expect(xml).toContain('href="https://example.com"')
    // mj-button must be a direct child of mj-column, not inside mj-text content
    const bodyIdx = xml.indexOf('<mj-body')
    const btnIdx = xml.indexOf('<mj-button', bodyIdx)
    const textBeforeBtn = xml.slice(bodyIdx, btnIdx)
    expect(textBeforeBtn).not.toMatch(/<mj-text[^/]*>/)
  })

  it('email-columns produces two mj-column elements', async () => {
    const doc = await parseMarkdown('::email-columns\nLeft\n\nRight\n::')
    const xml = serializeMjml(await documentToMjmlJson(doc))
    const colCount = (xml.match(/<mj-column/g) ?? []).length
    expect(colCount).toBe(2)
  })

  it('email-divider produces mj-divider (not table html)', async () => {
    const doc = await parseMarkdown('::email-divider{border-color="#cccccc"}\n::')
    const xml = serializeMjml(await documentToMjmlJson(doc))
    expect(xml).toContain('<mj-divider')
    expect(xml).toContain('border-color="#cccccc"')
    // must NOT be table-based html
    expect(xml).not.toContain('comark-email-divider')
    expect(xml).not.toContain('<table')
  })
})
