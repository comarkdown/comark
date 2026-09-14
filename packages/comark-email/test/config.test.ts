import { describe, expect, it } from 'vitest'
import { buildPreheader, DEFAULT_EMAIL_CSS, frontmatterToMaizzleConfig } from '../src/config.ts'

describe('DEFAULT_EMAIL_CSS', () => {
  it('includes comark-email-columns class', () => {
    expect(DEFAULT_EMAIL_CSS).toContain('comark-email-columns')
  })

  it('includes comark-email-divider class', () => {
    expect(DEFAULT_EMAIL_CSS).toContain('comark-email-divider')
  })
})

describe('buildPreheader', () => {
  it('wraps text in a hidden div', () => {
    const html = buildPreheader('Hello preview')
    expect(html).toContain('Hello preview')
    expect(html).toContain('display:none')
    expect(html).toContain('overflow:hidden')
  })

  it('returns a div element', () => {
    const html = buildPreheader('Test')
    expect(html).toMatch(/^<div/)
    expect(html).toMatch(/<\/div>$/)
  })
})

describe('frontmatterToMaizzleConfig', () => {
  it('sets css.inline=true and css.purge=true', () => {
    const config = frontmatterToMaizzleConfig({}, '<html></html>')
    expect((config.css as Record<string, unknown>).inline).toBe(true)
    expect((config.css as Record<string, unknown>).purge).toBe(true)
  })

  it('passes html as tailwind content for class detection', () => {
    const html = '<html><body class="bg-primary">Test</body></html>'
    const config = frontmatterToMaizzleConfig({}, html)
    const tailwind = (config.css as Record<string, unknown>).tailwind as Record<string, unknown>
    const content = tailwind.content as Array<{ raw: string; extension: string }>
    expect(content).toHaveLength(1)
    expect(content[0].raw).toBe(html)
    expect(content[0].extension).toBe('html')
  })

  it('maps theme colors to tailwind theme.extend.colors', () => {
    const config = frontmatterToMaizzleConfig({ theme: { primary: '#0066cc', background: '#f4f5f7' } }, '')
    const tailwind = (config.css as Record<string, unknown>).tailwind as Record<string, unknown>
    const theme = tailwind.theme as { extend: { colors: Record<string, string> } }
    expect(theme.extend.colors.primary).toBe('#0066cc')
    expect(theme.extend.colors.background).toBe('#f4f5f7')
  })

  it('returns empty colors when no theme is provided', () => {
    const config = frontmatterToMaizzleConfig({}, '')
    const tailwind = (config.css as Record<string, unknown>).tailwind as Record<string, unknown>
    const theme = tailwind.theme as { extend: { colors: Record<string, string> } }
    expect(theme.extend.colors).toEqual({})
  })

  it('skips undefined theme values', () => {
    const config = frontmatterToMaizzleConfig({ theme: { primary: '#000', secondary: undefined } }, '')
    const tailwind = (config.css as Record<string, unknown>).tailwind as Record<string, unknown>
    const theme = tailwind.theme as { extend: { colors: Record<string, string | undefined> } }
    expect(theme.extend.colors.primary).toBe('#000')
    expect('secondary' in theme.extend.colors).toBe(false)
  })

  it('merges extra tailwindConfig over base', () => {
    const config = frontmatterToMaizzleConfig({}, '', { plugins: ['customPlugin'] })
    const tailwind = (config.css as Record<string, unknown>).tailwind as Record<string, unknown>
    expect(tailwind.plugins).toEqual(['customPlugin'])
  })

  it('extra tailwindConfig colors are merged with theme colors', () => {
    const config = frontmatterToMaizzleConfig({ theme: { primary: '#000' } }, '', {
      theme: { extend: { colors: { accent: '#ff0' } } },
    })
    const tailwind = (config.css as Record<string, unknown>).tailwind as Record<string, unknown>
    const colors = (tailwind.theme as { extend: { colors: Record<string, string> } }).extend.colors
    expect(colors.primary).toBe('#000')
    expect(colors.accent).toBe('#ff0')
  })
})
