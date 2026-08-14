import { describe, expect, it } from 'vitest'
import { createSSRApp, h, Suspense } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import { Markdown } from '../src/components/Markdown.ts'
import { MarkdownDocument } from '../src/components/MarkdownDocument.ts'

/**
 * Markdown accepts either a markdown string or a pre-parsed MarkdownDocument on
 * `value`. When a document is passed it should render via MarkdownDocument without
 * re-parsing.
 */
function renderMarkdownComponent(props: Record<string, unknown>) {
  const app = createSSRApp({
    setup() {
      return () => h(Suspense, null, { default: () => h(Markdown, props) })
    },
  })
  return renderToString(app as any)
}

function renderMarkdownDocumentComponent(props: Record<string, unknown>) {
  const app = createSSRApp({
    setup() {
      return () => h(MarkdownDocument, props)
    },
  })
  return renderToString(app as any)
}

describe('Markdown value as MarkdownDocument', () => {
  it('renders a pre-parsed document the same as MarkdownDocument', async () => {
    const document = await parseMarkdown('# Hello **World**')
    const fromMarkdown = await renderMarkdownComponent({ value: document })
    const fromParsed = await renderMarkdownDocumentComponent({ value: document })

    expect(fromMarkdown).toContain('<h1')
    expect(fromMarkdown).toContain('Hello <strong>World</strong>')
    expect(fromMarkdown).toBe(fromParsed)
  })

  it('still renders markdown strings', async () => {
    const html = await renderMarkdownComponent({ value: 'Hello **world**' })
    expect(html).toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })

  it('renders an empty document without crashing', async () => {
    const html = await renderMarkdownComponent({
      value: { nodes: [], frontmatter: {}, meta: {} },
    })
    expect(html).toContain('comark-content')
  })
})
