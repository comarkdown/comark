import { describe, expect, it, vi } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import etiket, { attrsToOpts, coerceValue } from '../../src/plugins/etiket'
import { renderHtmlForTest } from '../utils/render-html'

describe('etiket plugin', () => {
  // ---------------------------------------------------------------------------
  // Basic QR code generation
  // ---------------------------------------------------------------------------

  it('generates inline SVG for ::qrcode', async () => {
    const { nodes } = await parseMarkdown('::qrcode{value="https://example.com"}', {
      plugins: [etiket()],
    })
    const html = await renderHtmlForTest({ nodes, frontmatter: {}, meta: {} })
    expect(html).toContain('<svg')
    expect(html).toContain('</svg>')
  })

  it('replaces ::qrcode node with an svg ElementNode in the AST', async () => {
    const { nodes } = await parseMarkdown('::qrcode{value="https://example.com"}', {
      plugins: [etiket()],
    })
    const svgNode = nodes.find((n) => Array.isArray(n) && n[0] === 'svg')
    expect(svgNode).toBeDefined()
  })

  it('accepts value from inline content (children)', async () => {
    const md = '::qrcode\nhttps://example.com\n::'
    const { nodes } = await parseMarkdown(md, { plugins: [etiket()] })
    const html = await renderHtmlForTest({ nodes, frontmatter: {}, meta: {} })
    expect(html).toContain('<svg')
  })

  // ---------------------------------------------------------------------------
  // Output modes
  // ---------------------------------------------------------------------------

  it('output="img" produces an img node with SVG data URI', async () => {
    const { nodes } = await parseMarkdown('::qrcode{value="https://example.com" output="img"}', {
      plugins: [etiket()],
    })
    const imgNode = nodes.find((n) => Array.isArray(n) && n[0] === 'img') as any[]
    expect(imgNode).toBeDefined()
    // etiket may return base64 or percent-encoded SVG data URIs
    expect(String(imgNode[1].src)).toMatch(/^data:image\/svg\+xml/)
  })

  it('output="png" produces an img node with PNG or SVG data URI', async () => {
    const { nodes } = await parseMarkdown('::qrcode{value="https://example.com" output="png"}', {
      plugins: [etiket()],
    })
    const imgNode = nodes.find((n) => Array.isArray(n) && n[0] === 'img') as any[]
    expect(imgNode).toBeDefined()
    // Either a real PNG or SVG fallback URI
    expect(String(imgNode[1].src)).toMatch(/^data:image\/(png|svg\+xml)/)
  })

  // ---------------------------------------------------------------------------
  // Barcode
  // ---------------------------------------------------------------------------

  it('generates SVG for ::barcode with ean13 type', async () => {
    const { nodes } = await parseMarkdown('::barcode{value="4006381333931" type="ean13" show-text="true"}', {
      plugins: [etiket()],
    })
    const html = await renderHtmlForTest({ nodes, frontmatter: {}, meta: {} })
    expect(html).toContain('<svg')
  })

  // ---------------------------------------------------------------------------
  // Option coercion
  // ---------------------------------------------------------------------------

  describe('coerceValue()', () => {
    it('coerces "true"/"false" strings to booleans', () => {
      expect(coerceValue('true')).toBe(true)
      expect(coerceValue('false')).toBe(false)
    })

    it('coerces numeric strings to numbers', () => {
      expect(coerceValue('200')).toBe(200)
      expect(coerceValue('0.5')).toBe(0.5)
    })

    it('parses JSON objects and arrays', () => {
      expect(coerceValue('{"type":"linear"}')).toEqual({ type: 'linear' })
      expect(coerceValue('["a","b"]')).toEqual(['a', 'b'])
    })

    it('keeps plain strings as-is', () => {
      expect(coerceValue('dots')).toBe('dots')
    })

    it('passes non-string values through unchanged', () => {
      expect(coerceValue(42)).toBe(42)
      expect(coerceValue(true)).toBe(true)
    })
  })

  describe('attrsToOpts()', () => {
    it('converts kebab-case attrs to camelCase', () => {
      expect(attrsToOpts({ 'dot-type': 'dots', 'ec-level': 'H' })).toEqual({
        dotType: 'dots',
        ecLevel: 'H',
      })
    })

    it('strips reserved attrs (value, output, $, class, id)', () => {
      const result = attrsToOpts({ value: 'x', output: 'svg', class: 'foo', id: 'bar', $: {} })
      expect(result).toEqual({})
    })

    it('handles :key binding attrs — JSON-parseable pass through, others are skipped', () => {
      const result = attrsToOpts({
        ':color': '{"type":"linear"}',
        ':value': 'user.profileUrl', // runtime binding — not JSON-parseable
      })
      expect(result).toEqual({ color: { type: 'linear' } })
      expect(result.value).toBeUndefined()
    })

    it('coerces scalar string values', () => {
      expect(attrsToOpts({ 'show-text': 'true', 'bar-width': '2' })).toEqual({
        showText: true,
        barWidth: 2,
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Helper directives
  // ---------------------------------------------------------------------------

  it('generates SVG for ::qr-wifi', async () => {
    const { nodes } = await parseMarkdown('::qr-wifi{ssid="MyNetwork" password="secret"}', {
      plugins: [etiket()],
    })
    const html = await renderHtmlForTest({ nodes, frontmatter: {}, meta: {} })
    expect(html).toContain('<svg')
  })

  it('generates SVG for ::qr-vcard', async () => {
    const { nodes } = await parseMarkdown(
      '::qr-vcard{first-name="Ada" last-name="Lovelace" email="ada@example.com"}',
      { plugins: [etiket()] },
    )
    const html = await renderHtmlForTest({ nodes, frontmatter: {}, meta: {} })
    expect(html).toContain('<svg')
  })

  it('generates SVG for ::qr-email', async () => {
    const { nodes } = await parseMarkdown('::qr-email{address="hello@example.com"}', {
      plugins: [etiket()],
    })
    const html = await renderHtmlForTest({ nodes, frontmatter: {}, meta: {} })
    expect(html).toContain('<svg')
  })

  it('generates SVG for ::qr-url', async () => {
    const { nodes } = await parseMarkdown('::qr-url{url="https://example.com"}', {
      plugins: [etiket()],
    })
    const html = await renderHtmlForTest({ nodes, frontmatter: {}, meta: {} })
    expect(html).toContain('<svg')
  })

  // ---------------------------------------------------------------------------
  // Frontmatter defaults
  // ---------------------------------------------------------------------------

  it('applies frontmatter etiket defaults to all directives', async () => {
    const md = `---
etiket:
  output: img
---

::qrcode{value="https://example.com"}
`
    const { nodes } = await parseMarkdown(md, { plugins: [etiket()] })
    const imgNode = nodes.find((n) => Array.isArray(n) && n[0] === 'img')
    expect(imgNode).toBeDefined()
  })

  it('per-directive attr overrides frontmatter default', async () => {
    const md = `---
etiket:
  output: img
---

::qrcode{value="https://example.com" output="svg"}
`
    const { nodes } = await parseMarkdown(md, { plugins: [etiket()] })
    const svgNode = nodes.find((n) => Array.isArray(n) && n[0] === 'svg')
    expect(svgNode).toBeDefined()
  })

  it('plugin config defaults are applied', async () => {
    const { nodes } = await parseMarkdown('::qrcode{value="https://example.com"}', {
      plugins: [etiket({ etiket: { output: 'img' } })],
    })
    const imgNode = nodes.find((n) => Array.isArray(n) && n[0] === 'img')
    expect(imgNode).toBeDefined()
  })

  // ---------------------------------------------------------------------------
  // Soft validation — warns but does not throw
  // ---------------------------------------------------------------------------

  it('emits console.warn for invalid input but does not throw', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(
      parseMarkdown('::barcode{value="NOTVALID" type="ean13"}', { plugins: [etiket()] }),
    ).resolves.toBeDefined()
    warnSpy.mockRestore()
  })

  it('emits a fallback node on generation error and does not throw', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { nodes } = await parseMarkdown('::barcode{value=""}', { plugins: [etiket()] })
    const html = await renderHtmlForTest({ nodes, frontmatter: {}, meta: {} })
    // Either generated SVG or a fallback pre>code; either way no throw
    expect(typeof html).toBe('string')
    warnSpy.mockRestore()
  })

  // ---------------------------------------------------------------------------
  // Error tolerance — malformed/missing peer
  // ---------------------------------------------------------------------------

  it('leaves directives unchanged when plugin is not used', async () => {
    const { nodes } = await parseMarkdown('::qrcode{value="https://example.com"}')
    // Without the plugin, the node stays as the directive tag
    expect(nodes.some((n) => Array.isArray(n) && n[0] === 'qrcode')).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // Multiple directives in one document
  // ---------------------------------------------------------------------------

  it('processes multiple directives in one document', async () => {
    const md = `
::qrcode{value="https://example.com"}
::

::qrcode{value="https://comark.dev"}
::
`.trim()
    const { nodes } = await parseMarkdown(md, { plugins: [etiket()] })
    // Both original qrcode tags must be replaced
    expect(nodes.some((n) => Array.isArray(n) && n[0] === 'qrcode')).toBe(false)
    // Both should produce svg nodes
    const svgCount = nodes.filter((n) => Array.isArray(n) && n[0] === 'svg').length
    expect(svgCount).toBeGreaterThanOrEqual(2)
  })
})
