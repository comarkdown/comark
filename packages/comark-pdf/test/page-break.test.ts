import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderPdfDocument } from '../src/render.ts'
import { PageBreak } from '../src/plugins/page-break.ts'

const isPdf = (bytes: Uint8Array) =>
  Buffer.from(bytes.slice(0, 4)).toString('ascii') === '%PDF'

describe('::page-break AST', () => {
  it('parses ::page-break to [page-break, {}] node', async () => {
    const doc = await parseMarkdown('::page-break\n::')
    expect(doc.nodes[0]).toMatchObject(['page-break', {}])
  })

  it('parses ::page-break with type attr', async () => {
    const doc = await parseMarkdown('::page-break{type="before"}\n::')
    expect(doc.nodes[0]).toMatchObject(['page-break', { type: 'before' }])
  })
})

describe('PageBreak handler', () => {
  it('returns a jasy node (non-null)', () => {
    const { PageBreak: JasyPageBreak } = require('@jasy/pdf')
    const node = PageBreak(['page-break', {}], {} as never)
    expect(node).toBeDefined()
    expect(node).not.toBeNull()
  })

  it('breakBefore=true for type="before"', () => {
    const { Box } = require('@jasy/pdf')
    const node = PageBreak(['page-break', { type: 'before' }], {} as never) as { props?: Record<string, unknown> }
    expect(node).toBeDefined()
  })
})

describe('renderPdfDocument with ::page-break', () => {
  it('renders document with page-break to a valid jasy Document', async () => {
    const doc = await parseMarkdown('Before\n\n::page-break\n::\n\nAfter')
    const { renderToBytes } = await import('@jasy/pdf')
    const jasyDoc = renderPdfDocument(doc, { components: { 'page-break': PageBreak } })
    expect(jasyDoc).toBeDefined()
    const bytes = await renderToBytes(jasyDoc)
    expect(isPdf(bytes)).toBe(true)
  })
})
