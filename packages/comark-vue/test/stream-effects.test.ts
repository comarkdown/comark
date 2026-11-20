import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import type { MarkdownDocument as MarkdownDocumentType, Node } from 'comark'
import type { StreamEffect } from 'comark/stream'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

function doc(...nodes: Node[]): MarkdownDocumentType {
  return { nodes, frontmatter: {}, meta: {} }
}

function renderDoc(value: MarkdownDocumentType, props: Record<string, unknown> = {}) {
  return renderToString(createSSRApp({ render: () => h(MarkdownDocument, { value, ...props }) }))
}

describe('stream effects', () => {
  it('wraps streamed text in fade spans', async () => {
    const html = await renderDoc(doc(['p', {}, 'Hello']), { streaming: true, fade: { pace: false } })
    expect(html).toContain('<p><span class="comark-fade">Hello</span></p>')
  })

  it('does not fade without streaming', async () => {
    const html = await renderDoc(doc(['p', {}, 'Hello']), { fade: true })
    expect(html).not.toContain('comark-fade')
  })

  it('runs custom effects before the caret and never mutates the document', async () => {
    const value = doc(['p', {}, 'Hi'])
    const snapshot = JSON.stringify(value)
    const tag: StreamEffect = { name: 'tag', apply: (nodes) => [...nodes, ['p', { class: 'extra' }, 'More']] }
    const html = await renderDoc(value, { streaming: true, caret: { class: 'cursor' }, effects: [tag] })
    expect(html).toMatch(/<p class="extra">More<span class="cursor"/)
    expect(JSON.stringify(value)).toBe(snapshot)
  })
})
