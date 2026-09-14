import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderPdfFromDocument } from '../src/render.ts'
import { PageBreak } from '../src/plugins/page-break.ts'

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
  it('emits break-after element by default', () => {
    const output = PageBreak(['page-break', {}], {} as never)
    expect(output).toContain('class="comark-page-break"')
    expect(output).toContain('break-after:page')
  })

  it('emits break-before element when type="before"', () => {
    const output = PageBreak(['page-break', { type: 'before' }], {} as never)
    expect(output).toContain('break-before:page')
  })

  it('emits break-after element when type="after"', () => {
    const output = PageBreak(['page-break', { type: 'after' }], {} as never)
    expect(output).toContain('break-after:page')
  })
})

describe('renderPdfFromDocument with ::page-break', () => {
  it('renders page-break as a div element in the output HTML', async () => {
    const doc = await parseMarkdown('Before\n\n::page-break\n::\n\nAfter')
    const html = await renderPdfFromDocument(doc)
    expect(html).toContain('class="comark-page-break"')
    expect(html).toContain('break-after:page')
    expect(html).toContain('Before')
    expect(html).toContain('After')
  })
})
