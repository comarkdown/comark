import { describe, expect, it } from 'vitest'
import { createSSRApp, h, Suspense } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Markdown } from '../src/components/Markdown.ts'

/**
 * Tests for the `unwrap` shorthand prop and `options.unwrap` on the high-level
 * Markdown component — the MDC `unwrap="p"` migration path for inline rendering,
 * e.g. `<UButton><Markdown :value="text" unwrap /></UButton>`.
 */
function renderMarkdownComponent(props: Record<string, unknown>) {
  const app = createSSRApp({
    setup() {
      return () => h(Suspense, null, { default: () => h(Markdown, props) })
    },
  })
  return renderToString(app as any)
}

describe('Markdown unwrap', () => {
  it('wraps single-line content in a paragraph by default', async () => {
    const html = await renderMarkdownComponent({ value: 'Hello **world**' })
    expect(html).toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })

  it('drops the paragraph wrapper with the `unwrap` prop', async () => {
    const html = await renderMarkdownComponent({ value: 'Hello **world**', unwrap: true })
    expect(html).not.toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })

  it('accepts a tag string on the `unwrap` prop', async () => {
    const html = await renderMarkdownComponent({ value: 'Hello **world**', unwrap: 'p' })
    expect(html).not.toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })

  it('merges paragraphs without a separator', async () => {
    const html = await renderMarkdownComponent({ value: 'a\n\nb', unwrap: 'p' })
    expect(html).not.toContain('<p>')
    expect(html).not.toContain('<br')
    expect(html).toContain('ab')
  })

  it('supports `options.unwrap` equivalently', async () => {
    const html = await renderMarkdownComponent({ value: 'Hello **world**', options: { unwrap: 'p' } })
    expect(html).not.toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })
})
