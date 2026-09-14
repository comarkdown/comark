import { describe, expect, it } from 'vitest'
import { resolveEmailConfig, buildMjmlHead } from '../src/config.ts'

describe('resolveEmailConfig', () => {
  it('returns empty config when no frontmatter or options given', () => {
    const cfg = resolveEmailConfig({})
    expect(cfg.subject).toBeUndefined()
    expect(cfg.previewText).toBeUndefined()
    expect(cfg.brandColor).toBeUndefined()
  })

  it('reads subject from frontmatter.email', () => {
    const cfg = resolveEmailConfig({ email: { subject: 'Hello' } })
    expect(cfg.subject).toBe('Hello')
  })

  it('reads subject from top-level frontmatter alias', () => {
    const cfg = resolveEmailConfig({ subject: 'Top Level' })
    expect(cfg.subject).toBe('Top Level')
  })

  it('options.email.subject overrides frontmatter', () => {
    const cfg = resolveEmailConfig({ email: { subject: 'Original' } }, { email: { subject: 'Override' } })
    expect(cfg.subject).toBe('Override')
  })

  it('merge order: top-level < email: < options.email', () => {
    const cfg = resolveEmailConfig(
      { subject: 'TopLevel', email: { subject: 'EmailKey' } },
      { email: { subject: 'Option' } }
    )
    expect(cfg.subject).toBe('Option')
  })

  it('brandColor falls back to theme.primary', () => {
    const cfg = resolveEmailConfig({ email: { theme: { primary: '#abc123' } } })
    expect(cfg.brandColor).toBe('#abc123')
  })

  it('explicit brandColor is used even when theme.primary differs', () => {
    const cfg = resolveEmailConfig({ email: { brandColor: '#explicit', theme: { primary: '#other' } } })
    expect(cfg.brandColor).toBe('#explicit')
  })

  it('reads previewText from frontmatter.email', () => {
    const cfg = resolveEmailConfig({ email: { previewText: 'Preview' } })
    expect(cfg.previewText).toBe('Preview')
  })
})

describe('buildMjmlHead', () => {
  it('produces mj-head node', () => {
    const head = buildMjmlHead({})
    expect(head.tagName).toBe('mj-head')
    expect(Array.isArray(head.children)).toBe(true)
  })

  it('includes mj-title when subject is set', () => {
    const head = buildMjmlHead({ subject: 'My Email' })
    const title = head.children!.find((c) => c.tagName === 'mj-title')
    expect(title).toBeDefined()
    expect(title!.content).toBe('My Email')
  })

  it('omits mj-title when subject is not set', () => {
    const head = buildMjmlHead({})
    expect(head.children!.find((c) => c.tagName === 'mj-title')).toBeUndefined()
  })

  it('includes mj-preview when previewText is set', () => {
    const head = buildMjmlHead({ previewText: 'Preview text' })
    const preview = head.children!.find((c) => c.tagName === 'mj-preview')
    expect(preview).toBeDefined()
    expect(preview!.content).toBe('Preview text')
  })

  it('includes mj-attributes with mj-all font-family', () => {
    const head = buildMjmlHead({})
    const attrs = head.children!.find((c) => c.tagName === 'mj-attributes')
    expect(attrs).toBeDefined()
    const mjAll = attrs!.children!.find((c) => c.tagName === 'mj-all')
    expect(mjAll).toBeDefined()
    expect(mjAll!.attributes['font-family']).toBeTruthy()
  })

  it('includes mj-button in mj-attributes when brandColor is set', () => {
    const head = buildMjmlHead({ brandColor: '#0066cc' })
    const attrs = head.children!.find((c) => c.tagName === 'mj-attributes')!
    const btn = attrs.children!.find((c) => c.tagName === 'mj-button')
    expect(btn).toBeDefined()
    expect(btn!.attributes['background-color']).toBe('#0066cc')
  })

  it('omits mj-button in mj-attributes when brandColor is not set', () => {
    const head = buildMjmlHead({})
    const attrs = head.children!.find((c) => c.tagName === 'mj-attributes')!
    expect(attrs.children!.find((c) => c.tagName === 'mj-button')).toBeUndefined()
  })

  it('includes mj-body in mj-attributes when theme.background is set', () => {
    const head = buildMjmlHead({ theme: { background: '#f0f0f0' } })
    const attrs = head.children!.find((c) => c.tagName === 'mj-attributes')!
    const body = attrs.children!.find((c) => c.tagName === 'mj-body')
    expect(body).toBeDefined()
    expect(body!.attributes['background-color']).toBe('#f0f0f0')
  })

  it('includes mj-style when headCss is provided', () => {
    const head = buildMjmlHead({}, '.custom { color: red }')
    const style = head.children!.find((c) => c.tagName === 'mj-style')
    expect(style).toBeDefined()
    expect(style!.content).toContain('.custom')
  })

  it('omits mj-style when headCss is not provided', () => {
    const head = buildMjmlHead({})
    expect(head.children!.find((c) => c.tagName === 'mj-style')).toBeUndefined()
  })
})
