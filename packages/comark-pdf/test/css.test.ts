import { describe, expect, it } from 'vitest'
import { DEFAULT_BASE_CSS, frontmatterToPageCss } from '../src/css.ts'

describe('DEFAULT_BASE_CSS', () => {
  it('includes the page-break helper class', () => {
    expect(DEFAULT_BASE_CSS).toContain('comark-page-break')
    expect(DEFAULT_BASE_CSS).toContain('break-after:page')
  })
})

describe('frontmatterToPageCss', () => {
  it('returns empty string for undefined config', () => {
    expect(frontmatterToPageCss(undefined)).toBe('')
  })

  it('returns empty string for empty config', () => {
    expect(frontmatterToPageCss({})).toBe('')
  })

  it('generates size declaration from format only', () => {
    const css = frontmatterToPageCss({ format: 'A4' })
    expect(css).toContain('size: A4;')
  })

  it('includes orientation when provided', () => {
    const css = frontmatterToPageCss({ format: 'A4', orientation: 'landscape' })
    expect(css).toContain('size: A4 landscape;')
  })

  it('defaults to portrait orientation when format provided without orientation', () => {
    const css = frontmatterToPageCss({ format: 'Letter' })
    expect(css).toContain('size: Letter;')
    expect(css).not.toContain('portrait')
    expect(css).not.toContain('landscape')
  })

  it('handles string margin', () => {
    const css = frontmatterToPageCss({ format: 'A4', margin: '20mm' })
    expect(css).toContain('margin: 20mm;')
  })

  it('handles per-side margin object', () => {
    const css = frontmatterToPageCss({ format: 'A4', margin: { top: '10mm', right: '15mm', bottom: '10mm', left: '15mm' } })
    expect(css).toContain('margin: 10mm 15mm 10mm 15mm;')
  })

  it('fills missing margin sides from top', () => {
    const css = frontmatterToPageCss({ format: 'A4', margin: { top: '25mm' } })
    expect(css).toContain('margin: 25mm 25mm 25mm 25mm;')
  })

  it('generates center header margin box', () => {
    const css = frontmatterToPageCss({ format: 'A4', header: 'My Report' })
    expect(css).toContain('@top-center{content:"My Report"}')
  })

  it('generates left and right header margin boxes', () => {
    const css = frontmatterToPageCss({ format: 'A4', headerLeft: 'Draft', headerRight: 'Confidential' })
    expect(css).toContain('@top-left{content:"Draft"}')
    expect(css).toContain('@top-right{content:"Confidential"}')
  })

  it('generates center footer margin box', () => {
    const css = frontmatterToPageCss({ format: 'A4', footer: 'Footer text' })
    expect(css).toContain('@bottom-center{content:"Footer text"}')
  })

  it('replaces {{ page }} token with counter(page)', () => {
    const css = frontmatterToPageCss({ format: 'A4', footer: 'Page {{ page }}' })
    expect(css).toContain('counter(page)')
    expect(css).not.toContain('{{ page }}')
  })

  it('replaces {{ totalPages }} token with counter(pages)', () => {
    const css = frontmatterToPageCss({ format: 'A4', footer: 'of {{ totalPages }}' })
    expect(css).toContain('counter(pages)')
    expect(css).not.toContain('{{ totalPages }}')
  })

  it('handles mixed text and tokens in footer', () => {
    const css = frontmatterToPageCss({ format: 'A4', footer: 'Page {{ page }} of {{ totalPages }}' })
    expect(css).toContain('"Page " counter(page) " of " counter(pages)')
  })

  it('generates a full @page rule', () => {
    const css = frontmatterToPageCss({
      format: 'A4',
      orientation: 'portrait',
      margin: '20mm',
      header: 'Quarterly Report',
      footer: 'Page {{ page }} of {{ totalPages }}',
    })
    expect(css).toMatch(/^@page\{/)
    expect(css).toContain('size: A4 portrait;')
    expect(css).toContain('margin: 20mm;')
    expect(css).toContain('@top-center{content:"Quarterly Report"}')
    expect(css).toContain('@bottom-center')
    expect(css).toContain('counter(page)')
    expect(css).toContain('counter(pages)')
  })

  it('leaves footer-level sibling boxes independent', () => {
    const css = frontmatterToPageCss({ format: 'A4', footerLeft: 'Company', footerRight: '2026' })
    expect(css).toContain('@bottom-left{content:"Company"}')
    expect(css).toContain('@bottom-right{content:"2026"}')
  })
})
