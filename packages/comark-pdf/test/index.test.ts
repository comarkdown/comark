import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { createPdfRenderer, renderPdf, renderPdfFromDocument } from '../src/index.ts'
import math, { Math as MathComponent } from '../src/plugins/math.ts'
import { PageBreak } from '../src/plugins/page-break.ts'
import { BASIC_MARKDOWN, ADVANCED_MARKDOWN } from './fixtures/markdown.ts'

const isPdf = (bytes: Uint8Array) =>
  Buffer.from(bytes.slice(0, 4)).toString('ascii') === '%PDF'

describe('renderPdf', () => {
  it('returns PDF bytes', async () => {
    const bytes = await renderPdf('# Hello')
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.length).toBeGreaterThan(0)
    expect(isPdf(bytes)).toBe(true)
  })

  it('renders with custom width/height page size', async () => {
    const { Text } = await import('@jasy/pdf')
    const bytes = await renderPdf('::label\n::', {
      pdf: { width: '50mm', height: '65mm', margin: '3.5mm' },
      components: {
        label: () => Text('Label'),
      },
    })
    expect(isPdf(bytes)).toBe(true)
  })

  it('reads pdf config from frontmatter', async () => {
    const bytes = await renderPdf('---\npdf:\n  format: A4\n  orientation: landscape\n---\n\n# Doc')
    expect(isPdf(bytes)).toBe(true)
  })

  it('merges options.pdf over frontmatter pdf', async () => {
    const bytes = await renderPdf('---\npdf:\n  format: A4\n  margin: 10mm\n---\n# Doc', {
      pdf: { margin: '25mm' },
    })
    expect(isPdf(bytes)).toBe(true)
  })

  it('renders with header and footer page tokens', async () => {
    const bytes = await renderPdf('# Doc', {
      pdf: { format: 'A4', footer: 'Page {{ page }} of {{ totalPages }}' },
    })
    expect(isPdf(bytes)).toBe(true)
  })

  it('renders basic markdown content', async () => {
    const bytes = await renderPdf('**Bold** and _italic_')
    expect(isPdf(bytes)).toBe(true)
  })

  it('applies custom components via JasyComponentFn', async () => {
    const { Text } = await import('@jasy/pdf')
    const bytes = await renderPdf('::note\nHello\n::', {
      components: {
        note: () => Text('Hello from note'),
      },
    })
    expect(isPdf(bytes)).toBe(true)
  })

  it('basic fixture — renders multi-page document', async () => {
    const bytes = await renderPdf(BASIC_MARKDOWN)
    expect(isPdf(bytes)).toBe(true)
    expect(bytes.length).toBeGreaterThan(1000)
  })

  it('advanced fixture — renders document with header/footer tokens', async () => {
    const bytes = await renderPdf(ADVANCED_MARKDOWN)
    expect(isPdf(bytes)).toBe(true)
  })

  it('advanced fixture — renders with math plugin', async () => {
    const bytes = await renderPdf(ADVANCED_MARKDOWN, {
      plugins: [math()],
      components: { Math: MathComponent },
    })
    expect(isPdf(bytes)).toBe(true)
  })
})

describe('createPdfRenderer', () => {
  it('creates a reusable render function', async () => {
    const render = createPdfRenderer({ pdf: { format: 'A4' } })
    const [bytes1, bytes2] = await Promise.all([render('# First'), render('# Second')])
    expect(isPdf(bytes1)).toBe(true)
    expect(isPdf(bytes2)).toBe(true)
  })
})

describe('renderPdfFromDocument', () => {
  it('renders from a pre-parsed document', async () => {
    const doc = await parseMarkdown('# Title\n\nParagraph.')
    const bytes = await renderPdfFromDocument(doc, { pdf: { format: 'A4' } })
    expect(isPdf(bytes)).toBe(true)
  })

  it('reads pdf config from frontmatter', async () => {
    const doc = await parseMarkdown(BASIC_MARKDOWN)
    const bytes = await renderPdfFromDocument(doc)
    expect(isPdf(bytes)).toBe(true)
  })

  it('PageBreak component produces valid PDF bytes', async () => {
    const doc = await parseMarkdown('Before\n\n::page-break\n::\n\nAfter')
    const bytes = await renderPdfFromDocument(doc, { components: { 'page-break': PageBreak } })
    expect(isPdf(bytes)).toBe(true)
  })
})
