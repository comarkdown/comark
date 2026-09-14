import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { createEmailRenderer, renderEmail, renderEmailFromDocument } from '../src/index.ts'
import math, { Math as MathComponent } from '../src/plugins/math.ts'
import { BASIC_EMAIL_MARKDOWN, ADVANCED_EMAIL_MARKDOWN } from './fixtures/markdown.ts'

describe('renderEmail', () => {
  it('returns an object with html, subject, previewText, and errors', async () => {
    const result = await renderEmail('# Hello')
    expect(result).toHaveProperty('html')
    expect(result).toHaveProperty('errors')
    expect(Array.isArray(result.errors)).toBe(true)
  })

  it('returns a complete HTML document', async () => {
    const { html } = await renderEmail('# Hello')
    expect(html).toMatch(/^<!doctype html>/i)
    expect(html).toContain('<html')
    expect(html).toContain('<body')
    expect(html).toContain('Hello')
  })

  it('extracts subject from frontmatter', async () => {
    const { subject } = await renderEmail('---\nemail:\n  subject: "Test Subject"\n---\n# Hi')
    expect(subject).toBe('Test Subject')
  })

  it('extracts previewText from frontmatter', async () => {
    const { previewText } = await renderEmail('---\nemail:\n  previewText: "Preview here"\n---\n# Hi')
    expect(previewText).toBe('Preview here')
  })

  it('injects the preheader when previewText is set', async () => {
    const { html } = await renderEmail('---\nemail:\n  previewText: "Preview"\n---\n# Hi')
    expect(html).toContain('Preview')
    expect(html).toContain('display:none')
  })

  it('options.email subject overrides frontmatter subject', async () => {
    const { subject } = await renderEmail('---\nemail:\n  subject: "Original"\n---\n# Hi', {
      email: { subject: 'Override' },
    })
    expect(subject).toBe('Override')
  })

  it('renders markdown body inside the document', async () => {
    const { html } = await renderEmail('**Bold** and _italic_')
    expect(html).toContain('<strong>')
    expect(html).toContain('<em>')
  })

  it('applies custom components', async () => {
    const { html } = await renderEmail('::note\nHello\n::', {
      components: {
        note: async ([, , ...children], state) => `<aside>${await state.render(children)}</aside>`,
      },
    })
    expect(html).toContain('<aside>')
  })

  it('injects custom baseCss into the style block', async () => {
    const { html } = await renderEmail('# Hello', { baseCss: '.custom{color:red}' })
    expect(html).toContain('.custom')
  })

  it('basic fixture — renders subject and previewText from frontmatter', async () => {
    const { subject, previewText } = await renderEmail(BASIC_EMAIL_MARKDOWN)
    expect(subject).toBe('Hello from Comark')
    expect(previewText).toBe('This is the email preview text.')
  })

  it('basic fixture — returns a complete HTML document', async () => {
    const { html, errors } = await renderEmail(BASIC_EMAIL_MARKDOWN)
    expect(html).toMatch(/^<!doctype html>/i)
    expect(html).toContain('Welcome')
    expect(html).toContain('Inline CSS via Maizzle')
    expect(errors).toHaveLength(0)
  })

  it('advanced fixture — renders email-button component', async () => {
    const { html } = await renderEmail(ADVANCED_EMAIL_MARKDOWN)
    expect(html).toContain('href="https://example.com/track"')
    expect(html).toContain('Track Package')
  })

  it('advanced fixture — renders email-columns and email-divider', async () => {
    const { html } = await renderEmail(ADVANCED_EMAIL_MARKDOWN)
    expect(html).toContain('comark-email-columns')
    expect(html).toContain('comark-email-divider')
  })

  it('advanced fixture — renders math with math plugin', async () => {
    const { html } = await renderEmail('$E = mc^2$', {
      plugins: [math()],
      components: { Math: MathComponent },
    })
    expect(html).toContain('katex')
  })
})

describe('createEmailRenderer', () => {
  it('creates a reusable render function', async () => {
    const render = createEmailRenderer({ email: { subject: 'Reusable' } })
    const [r1, r2] = await Promise.all([render('# First'), render('# Second')])
    expect(r1.html).toContain('First')
    expect(r2.html).toContain('Second')
    expect(r1.subject).toBe('Reusable')
    expect(r2.subject).toBe('Reusable')
  })
})

describe('renderEmailFromDocument', () => {
  it('renders from a pre-parsed document', async () => {
    const doc = await parseMarkdown('# Title\n\nParagraph.')
    const { html } = await renderEmailFromDocument(doc, { email: { subject: 'From Doc' } })
    expect(html).toContain('Title')
    expect(html).toContain('Paragraph')
  })

  it('reads email config from frontmatter', async () => {
    const doc = await parseMarkdown('---\nemail:\n  subject: "Doc Subject"\n---\n# Hello')
    const { subject } = await renderEmailFromDocument(doc)
    expect(subject).toBe('Doc Subject')
  })

  it('basic fixture — reads email config from frontmatter', async () => {
    const doc = await parseMarkdown(BASIC_EMAIL_MARKDOWN)
    const { subject, previewText } = await renderEmailFromDocument(doc)
    expect(subject).toBe('Hello from Comark')
    expect(previewText).toBe('This is the email preview text.')
  })
})
