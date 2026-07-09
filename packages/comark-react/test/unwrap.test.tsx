import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Comark } from '../src/components/Comark'

/**
 * Tests for the `unwrap` shorthand prop / `options.unwrap` on the high-level
 * Comark component — the MDC `unwrap="p"` migration path for inline rendering.
 *
 * `Comark` is an async server component, so we await it to obtain the element
 * before handing it to `renderToString`.
 */
async function renderComark(props: Record<string, unknown>) {
  const element = await Comark(props as any)
  return renderToString(element as React.ReactElement)
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

  it('merges paragraphs into a single string without a separator', async () => {
    const html = await renderComark({ markdown: 'a\n\nb', unwrap: 'p' })
    expect(html).not.toContain('<p>')
    expect(html).not.toContain('<br')
    // Adjacent paragraphs collapse into one text node (MDC behaviour), so
    // there's no comment marker between them.
    expect(html).not.toContain('a<!-- -->b')
    expect(html).toContain('ab')
  })

  it('supports `options.unwrap` equivalently', async () => {
    const html = await renderComark({ markdown: 'Hello **world**', options: { unwrap: 'p' } })
    expect(html).not.toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })
})
