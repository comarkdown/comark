import { describe, expect, it } from 'vitest'
import { createSSRApp, h, Suspense } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Comark } from '../src/components/Comark.ts'

/**
 * Tests for the `unwrap` shorthand prop and `options.unwrap` on the high-level
 * Comark component — the MDC `unwrap="p"` migration path for inline rendering,
 * e.g. `<UButton><Comark :markdown="text" unwrap /></UButton>`.
 */
function renderComark(props: Record<string, unknown>) {
  const app = createSSRApp({
    setup() {
      return () => h(Suspense, null, { default: () => h(Comark, props) })
    },
  })
  return renderToString(app as any)
}

describe('Comark unwrap', () => {
  it('wraps single-line content in a paragraph by default', async () => {
    const html = await renderComark({ markdown: 'Hello **world**' })
    expect(html).toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })

  it('drops the paragraph wrapper with the `unwrap` prop', async () => {
    const html = await renderComark({ markdown: 'Hello **world**', unwrap: true })
    expect(html).not.toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })

  it('accepts a tag string on the `unwrap` prop', async () => {
    const html = await renderComark({ markdown: 'Hello **world**', unwrap: 'p' })
    expect(html).not.toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })

  it('merges paragraphs without a separator', async () => {
    const html = await renderComark({ markdown: 'a\n\nb', unwrap: 'p' })
    expect(html).not.toContain('<p>')
    expect(html).not.toContain('<br')
    expect(html).toContain('ab')
  })

  it('supports `options.unwrap` equivalently', async () => {
    const html = await renderComark({ markdown: 'Hello **world**', options: { unwrap: 'p' } })
    expect(html).not.toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })
})
