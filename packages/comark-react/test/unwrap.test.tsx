import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Markdown } from '../src/components/Markdown'

// `Markdown` is an async server component, so await it before `renderToString`.
async function renderMarkdownComponent(props: Record<string, unknown>) {
  const element = await Markdown(props as any)
  return renderToString(element as React.ReactElement)
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

  it('merges paragraphs into a single string without a separator', async () => {
    const html = await renderMarkdownComponent({ value: 'a\n\nb', unwrap: 'p' })
    expect(html).not.toContain('<p>')
    expect(html).not.toContain('<br')
    // Adjacent paragraphs collapse into one text node (MDC behaviour), so
    // there's no comment marker between them.
    expect(html).not.toContain('a<!-- -->b')
    expect(html).toContain('ab')
  })

  it('supports `options.unwrap` equivalently', async () => {
    const html = await renderMarkdownComponent({ value: 'Hello **world**', options: { unwrap: 'p' } })
    expect(html).not.toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })
})
