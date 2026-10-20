import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToReadableStream, renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import { Markdown } from '../src/components/Markdown'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import { MarkdownLive } from '../src/components/MarkdownLive'
import { defineMarkdownComponent, defineMarkdownDocumentComponent } from '../src/index'

/**
 * HTML attributes that are not renderer options (`data-*`, `aria-*`, `id`,
 * `role`, `style`, ...) land on the `comark-content` root element.
 */
const attrs = {
  id: 'answer',
  role: 'region',
  'data-testid': 'answer',
  'data-message-id': '42',
  'aria-label': 'Assistant reply',
  'aria-busy': true,
  style: { color: 'red' },
}

function rootTag(html: string): string {
  return html.match(/<div[^>]*class="comark-content[^>]*>/)?.[0] ?? ''
}

function expectRootAttributes(html: string) {
  const root = rootTag(html)
  expect(root).toContain('id="answer"')
  expect(root).toContain('role="region"')
  expect(root).toContain('data-testid="answer"')
  expect(root).toContain('data-message-id="42"')
  expect(root).toContain('aria-label="Assistant reply"')
  expect(root).toContain('aria-busy="true"')
  expect(root).toContain('style="color:red"')
  expect(root).toContain('class="comark-content custom"')
}

async function renderAsync(element: React.ReactElement): Promise<string> {
  const stream = await renderToReadableStream(element)
  await stream.allReady
  return new Response(stream).text()
}

async function renderMarkdown(props: Record<string, unknown>) {
  const element = await Markdown(props as any)
  return renderToString(element as React.ReactElement)
}

describe('root element attributes', () => {
  it('Markdown sets them on the root element', async () => {
    const html = await renderMarkdown({ value: 'Hello **world**', className: 'custom', ...attrs })
    expectRootAttributes(html)
    expect(html).toContain('<strong>world</strong>')
  })

  it('Markdown sets them when given a pre-parsed document', async () => {
    const value = await parseMarkdown('Hello **world**')
    expectRootAttributes(await renderMarkdown({ value, className: 'custom', ...attrs }))
  })

  it('Markdown keeps renderer options off the DOM', async () => {
    const html = await renderMarkdown({
      value: 'Hello',
      unwrap: true,
      data: { a: 1 },
      options: {},
      plugins: [],
      'data-testid': 'answer',
    })
    const root = rootTag(html)
    expect(root).toContain('data-testid="answer"')
    expect(root).not.toMatch(/unwrap|options|plugins|caret|streaming|components/)
    expect(html).not.toContain('<p>')
  })

  it('Markdown sets them in streaming mode (MarkdownClient)', async () => {
    const element = await Markdown({ value: 'Hello **world**', streaming: true, className: 'custom', ...attrs } as any)
    const html = await renderAsync(element as React.ReactElement)
    expectRootAttributes(html)
    expect(html).toContain('<strong>world</strong>')
  })

  it('MarkdownDocument sets them on the root element', async () => {
    const value = await parseMarkdown('Hello')
    expectRootAttributes(
      renderToString(
        <MarkdownDocument
          value={value}
          className="custom"
          {...attrs}
        />
      )
    )
  })

  it('MarkdownLive sets them on the root element', async () => {
    const value = await parseMarkdown('Hello')
    expectRootAttributes(
      renderToString(
        <MarkdownLive
          value={value}
          documentKey="doc"
          className="custom"
          {...attrs}
        />
      )
    )
  })

  it('defineMarkdownComponent forwards them', async () => {
    const value = await parseMarkdown('Hello')
    const Defined = defineMarkdownComponent({ className: 'custom' })
    expectRootAttributes(
      await renderAsync(
        <Defined
          value={value}
          {...attrs}
        />
      )
    )
  })

  it('defineMarkdownDocumentComponent forwards them', async () => {
    const value = await parseMarkdown('Hello')
    const Defined = defineMarkdownDocumentComponent({ className: 'custom' })
    expectRootAttributes(
      renderToString(
        <Defined
          value={value}
          {...attrs}
        />
      )
    )
  })
})
