import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parse } from 'comark'
import { Markdown } from '../src/components/Markdown'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

/**
 * Markdown accepts either a markdown string or a pre-parsed MarkdownDocument on
 * `value`. When a tree is passed it should render via MarkdownDocument without
 * re-parsing.
 */
async function renderMarkdownComponent(props: Record<string, unknown>) {
  const element = await Markdown(props as any)
  return renderToString(element as React.ReactElement)
}

function renderMarkdownDocumentComponent(props: Record<string, unknown>) {
  return renderToString(<MarkdownDocument {...(props as any)} />)
}

describe('Markdown value as MarkdownDocument', () => {
  it('renders a pre-parsed tree the same as MarkdownDocument', async () => {
    const tree = await parse('# Hello **World**')
    const fromMarkdown = await renderMarkdownComponent({ value: tree })
    const fromParsed = renderMarkdownDocumentComponent({ value: tree })

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
