import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { createPdfRenderer, renderPdf, renderPdfFromDocument } from '../src/index.ts'
import math, { Math as MathComponent } from '../src/plugins/math.ts'
import { PageBreak } from '../src/plugins/page-break.ts'
import { BASIC_MARKDOWN, ADVANCED_MARKDOWN } from './fixtures/markdown.ts'

describe('renderPdf', () => {
  it('returns a complete HTML document', async () => {
    const html = await renderPdf('# Hello')
    expect(html).toMatch(/^<!doctype html>/i)
    expect(html).toContain('<html')
    expect(html).toContain('<body')
    expect(html).toContain('<h1')
    expect(html).toContain('Hello')
  })

  it('embeds @page CSS from options.pdf', async () => {
    const html = await renderPdf('# Hello', { pdf: { format: 'A4', margin: '20mm' } })
    expect(html).toContain('@page')
    expect(html).toContain('size: A4;')
    expect(html).toContain('margin: 20mm;')
  })

  it('embeds @page CSS from frontmatter pdf key', async () => {
    const html = await renderPdf('---\npdf:\n  format: Letter\n  orientation: landscape\n---\n\n# Doc')
    expect(html).toContain('size: Letter landscape;')
  })

  it('merges options.pdf over frontmatter pdf', async () => {
    const html = await renderPdf('---\npdf:\n  format: A4\n  margin: 10mm\n---\n# Doc', {
      pdf: { margin: '25mm' },
    })
    expect(html).toContain('margin: 25mm;')
    expect(html).not.toContain('margin: 10mm;')
  })

  it('includes footer counter tokens in CSS', async () => {
    const html = await renderPdf('# Doc', {
      pdf: { format: 'A4', footer: 'Page {{ page }} of {{ totalPages }}' },
    })
    expect(html).toContain('counter(page)')
    expect(html).toContain('counter(pages)')
  })

  it('injects custom baseCss', async () => {
    const html = await renderPdf('# Hello', { baseCss: 'body{font-family:sans-serif}' })
    expect(html).toContain('body{font-family:sans-serif}')
  })

  it('renders markdown body inside the document', async () => {
    const html = await renderPdf('**Bold** and _italic_')
    expect(html).toContain('<strong>')
    expect(html).toContain('<em>')
  })

  it('applies custom components', async () => {
    const html = await renderPdf('::note\nHello\n::', {
      components: {
        note: async ([, , ...children], state) => `<aside>${await state.render(children)}</aside>`,
      },
    })
    expect(html).toContain('<aside>')
  })

  it('basic fixture — renders multi-page document structure', async () => {
    const html = await renderPdf(BASIC_MARKDOWN)
    expect(html).toMatch(/^<!doctype html>/i)
    expect(html).toContain('Hello PDF')
    expect(html).toContain('Second Page')
    expect(html).toContain('comark-page-break')
    expect(html).toContain('@page')
    expect(html).toContain('size: A4;')
    expect(html).toContain('margin: 20mm;')
  })

  it('advanced fixture — renders header/footer tokens and math passthrough', async () => {
    const html = await renderPdf(ADVANCED_MARKDOWN)
    expect(html).toContain('Advanced Document')
    expect(html).toContain('counter(page)')
    expect(html).toContain('counter(pages)')
    expect(html).toContain('Advanced PDF')
  })

  it('advanced fixture — renders math with math plugin', async () => {
    const html = await renderPdf(ADVANCED_MARKDOWN, {
      plugins: [math()],
      components: { Math: MathComponent },
    })
    expect(html).toContain('katex')
    expect(html).toContain('Advanced Document')
  })
})

describe('createPdfRenderer', () => {
  it('creates a reusable render function', async () => {
    const render = createPdfRenderer({ pdf: { format: 'A4' } })
    const [html1, html2] = await Promise.all([render('# First'), render('# Second')])
    expect(html1).toContain('First')
    expect(html2).toContain('Second')
    expect(html1).toContain('@page')
    expect(html2).toContain('@page')
  })
})

describe('renderPdfFromDocument', () => {
  it('renders from a pre-parsed document', async () => {
    const doc = await parseMarkdown('# Title\n\nParagraph.')
    const html = await renderPdfFromDocument(doc, { pdf: { format: 'A4' } })
    expect(html).toContain('Title')
    expect(html).toContain('Paragraph')
    expect(html).toContain('size: A4;')
  })

  it('includes the comark-page-break base CSS by default', async () => {
    const doc = await parseMarkdown('# Hello')
    const html = await renderPdfFromDocument(doc)
    expect(html).toContain('comark-page-break')
  })

  it('basic fixture — reads pdf config from frontmatter', async () => {
    const doc = await parseMarkdown(BASIC_MARKDOWN)
    const html = await renderPdfFromDocument(doc)
    expect(html).toContain('size: A4;')
    expect(html).toContain('margin: 20mm;')
    expect(html).toContain('Hello PDF')
  })

  it('basic fixture — PageBreak component renders break-after div', async () => {
    const doc = await parseMarkdown(BASIC_MARKDOWN)
    const html = await renderPdfFromDocument(doc, { components: { 'page-break': PageBreak } })
    expect(html).toContain('break-after:page')
  })
})
