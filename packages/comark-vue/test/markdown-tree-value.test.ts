import { describe, expect, it } from 'vitest'
import { createSSRApp, h, Suspense } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parse } from 'comark'
import { Markdown } from '../src/components/Markdown.ts'
import { MarkdownParsed } from '../src/components/MarkdownParsed.ts'

/**
 * Markdown accepts either a markdown string or a pre-parsed MarkdownTree on
 * `value`. When a tree is passed it should render via MarkdownParsed without
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

function renderMarkdownParsedComponent(props: Record<string, unknown>) {
  const app = createSSRApp({
    setup() {
      return () => h(MarkdownParsed, props)
    },
  })
  return renderToString(app as any)
}

describe('Markdown value as MarkdownTree', () => {
  it('renders a pre-parsed tree the same as MarkdownParsed', async () => {
    const tree = await parse('# Hello **World**')
    const fromMarkdown = await renderMarkdownComponent({ value: tree })
    const fromParsed = await renderMarkdownParsedComponent({ value: tree })

    expect(fromMarkdown).toContain('<h1')
    expect(fromMarkdown).toContain('Hello <strong>World</strong>')
    expect(fromMarkdown).toBe(fromParsed)
  })

  it('still renders markdown strings', async () => {
    const html = await renderMarkdownComponent({ value: 'Hello **world**' })
    expect(html).toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })

  it('renders an empty tree without crashing', async () => {
    const html = await renderMarkdownComponent({
      value: { nodes: [], frontmatter: {}, meta: {} },
    })
    expect(html).toContain('comark-content')
  })
})
