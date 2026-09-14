import { describe, expect, it } from 'vitest'
import type { State } from 'comark'
import { parseMarkdown } from 'comark'
import { renderEmailFromDocument } from '../src/render.ts'
import { EmailButton } from '../src/plugins/email-button.ts'
import { EmailColumns } from '../src/plugins/email-columns.ts'
import { EmailDivider } from '../src/plugins/email-divider.ts'

const fakeState = (render: (nodes: unknown) => Promise<string>) => ({ render }) as unknown as State

describe('::email-button AST', () => {
  it('parses ::email-button to [email-button, {}] node', async () => {
    const doc = await parseMarkdown('::email-button\nClick\n::')
    const node = doc.nodes[0] as [string, Record<string, unknown>, ...unknown[]]
    expect(node[0]).toBe('email-button')
    expect(node[1]).toEqual({})
  })

  it('parses ::email-button with href and class attrs', async () => {
    const doc = await parseMarkdown('::email-button{href="https://example.com" class="bg-primary"}\nClick\n::')
    const node = doc.nodes[0] as [string, Record<string, unknown>, ...unknown[]]
    expect(node[0]).toBe('email-button')
    expect(node[1]).toMatchObject({ href: 'https://example.com', class: 'bg-primary' })
  })
})

describe('EmailButton handler', () => {
  it('emits an anchor element with href', async () => {
    const html = await EmailButton(
      ['email-button', { href: 'https://example.com' }],
      fakeState(async () => 'Click')
    )
    expect(html).toContain('href="https://example.com"')
    expect(html).toMatch(/<a /)
    expect(html).toContain('Click')
  })

  it('defaults href to # when missing', async () => {
    const html = await EmailButton(
      ['email-button', {}],
      fakeState(async () => 'Go')
    )
    expect(html).toContain('href="#"')
  })

  it('includes class attribute when provided', async () => {
    const html = await EmailButton(
      ['email-button', { href: '#', class: 'bg-primary text-white' }],
      fakeState(async () => '')
    )
    expect(html).toContain('class="bg-primary text-white"')
  })

  it('does not include class attribute when not provided', async () => {
    const html = await EmailButton(
      ['email-button', { href: '#' }],
      fakeState(async () => '')
    )
    expect(html).not.toContain('class=')
  })

  it('includes target and rel for security', async () => {
    const html = await EmailButton(
      ['email-button', { href: '#' }],
      fakeState(async () => '')
    )
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
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

describe('EmailColumns handler', () => {
  it('emits a table element', async () => {
    const html = await EmailColumns(
      ['email-columns', {}],
      fakeState(async () => '<td>col</td>')
    )
    expect(html).toContain('<table')
    expect(html).toContain('comark-email-columns')
    expect(html).toContain('<tr>')
  })

  it('includes extra class when provided', async () => {
    const html = await EmailColumns(
      ['email-columns', { class: 'gap-4' }],
      fakeState(async () => '')
    )
    expect(html).toContain('gap-4')
  })

  it('wraps each child in a td', async () => {
    const children = ['Left', 'Right']
    let callCount = 0
    const html = await EmailColumns(
      ['email-columns', {}, ...children] as Parameters<typeof EmailColumns>[0],
      fakeState(async (nodes) => {
        callCount++
        return `<p>${nodes}</p>`
      })
    )
    expect(callCount).toBe(2)
    expect(html).toContain('<td valign="top">')
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

describe('EmailDivider handler', () => {
  it('emits a table with hr inside', () => {
    const html = EmailDivider(['email-divider', {}], {} as never)
    expect(html).toContain('comark-email-divider')
    expect(html).toContain('<hr')
    expect(html).toContain('<table')
  })

  it('includes class on hr when provided', () => {
    const html = EmailDivider(['email-divider', { class: 'border-gray-200' }], {} as never)
    expect(html).toContain('class="border-gray-200"')
  })
})

describe('renderEmailFromDocument with email components', () => {
  it('renders email-button as an anchor element', async () => {
    const doc = await parseMarkdown('::email-button{href="https://example.com"}\nClick\n::')
    const { html } = await renderEmailFromDocument(doc)
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('Click')
  })

  it('renders email-divider as a table element', async () => {
    const doc = await parseMarkdown('Before\n\n::email-divider\n::\n\nAfter')
    const { html } = await renderEmailFromDocument(doc)
    expect(html).toContain('comark-email-divider')
    expect(html).toContain('<hr')
    expect(html).toContain('Before')
    expect(html).toContain('After')
  })
})
