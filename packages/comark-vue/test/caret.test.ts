import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMarkdownParser, parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument.ts'

function freeze(value: unknown): void {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
}

describe('streaming caret', () => {
  it.each(['Hello.', '> Hello **world**'])('preserves the input when rendering %s repeatedly', async (source) => {
    const document = await parseMarkdown(source)
    const original = structuredClone(document)
    freeze(document)

    for (let i = 0; i < 3; i++) {
      const html = await renderToString(
        createSSRApp(() => h(MarkdownDocument, { value: document, streaming: true, caret: { class: 'test-caret' } }))
      )
      expect(html.match(/class="test-caret"/g)).toHaveLength(1)
      expect(document).toEqual(original)
    }
    expect(
      await renderToString(createSSRApp(() => h(MarkdownDocument, { value: document, caret: { class: 'test-caret' } })))
    ).not.toContain('test-caret')
  })

  it.each(['![image](/image.png)', 'plain text', '<!-- trailing comment -->'])(
    'appends a caret after unwrapped content: %s',
    async (source) => {
      const document = await parseMarkdown(source, { unwrap: true })
      const original = structuredClone(document)
      freeze(document)
      const html = await renderToString(
        createSSRApp(() => h(MarkdownDocument, { value: document, streaming: true, caret: { class: 'test-caret' } }))
      )

      expect(html.match(/class="test-caret"/g)).toHaveLength(1)
      expect(document).toEqual(original)
    }
  )

  it('leaves the caret out when streaming is disabled', async () => {
    const document = await parseMarkdown('Hello.')
    const original = structuredClone(document)
    freeze(document)
    const html = await renderToString(
      createSSRApp(() => h(MarkdownDocument, { value: document, caret: { class: 'test-caret' } }))
    )

    expect(html).not.toContain('test-caret')
    expect(document).toEqual(original)
  })

  it('does not add carets to documents reused by the streaming parser', async () => {
    const parse = createMarkdownParser()
    for (const source of ['First\n\nTail', 'First\n\nTail grows', 'First\n\nTail grows again']) {
      const document = await parse(source, { streaming: true })
      const original = structuredClone(document)
      const html = await renderToString(
        createSSRApp(() => h(MarkdownDocument, { value: document, streaming: true, caret: { class: 'test-caret' } }))
      )
      expect(html.match(/class="test-caret"/g)).toHaveLength(1)
      expect(document).toEqual(original)
    }
  })

  it('leaves an empty document empty', async () => {
    const document = await parseMarkdown('')
    expect(
      await renderToString(
        createSSRApp(() => h(MarkdownDocument, { value: document, streaming: true, caret: { class: 'test-caret' } }))
      )
    ).not.toContain('test-caret')
  })
})
