import { describe, expect, it } from 'vitest'
import { createSSRApp, h, Suspense } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import { Markdown } from '../src/components/Markdown.ts'
import { MarkdownDocument } from '../src/components/MarkdownDocument.ts'
import { defineMarkdownComponent, defineMarkdownDocumentComponent } from '../src/index.ts'

/**
 * HTML attributes that are not component props (`data-*`, `aria-*`, `id`,
 * `role`, `style`, ...) fall through to the `comark-content` root element.
 */
const attrs = {
  id: 'answer',
  role: 'region',
  'data-testid': 'answer',
  'data-message-id': '42',
  'aria-label': 'Assistant reply',
  'aria-busy': 'true',
  style: 'color: red',
  class: 'custom',
}

function renderComponent(component: any, props: Record<string, unknown>) {
  const app = createSSRApp({
    setup() {
      return () => h(Suspense, null, { default: () => h(component, props) })
    },
  })
  return renderToString(app as any)
}

function rootTag(html: string): string {
  return html.match(/<div[^>]*class="[^"]*comark-content[^>]*>/)?.[0] ?? ''
}

function expectRootAttributes(html: string) {
  const root = rootTag(html)
  expect(root).toContain('id="answer"')
  expect(root).toContain('role="region"')
  expect(root).toContain('data-testid="answer"')
  expect(root).toContain('data-message-id="42"')
  expect(root).toContain('aria-label="Assistant reply"')
  expect(root).toContain('aria-busy="true"')
  expect(root).toContain('style="color:red;"')
  expect(root).toMatch(/class="[^"]*\bcustom\b/)
}

describe('root element attributes', () => {
  it('Markdown sets them on the root element', async () => {
    const html = await renderComponent(Markdown, { value: 'Hello **world**', ...attrs })
    expectRootAttributes(html)
    expect(html).toContain('<strong>world</strong>')
  })

  it('Markdown sets them in streaming mode', async () => {
    expectRootAttributes(await renderComponent(Markdown, { value: 'Hello', streaming: true, ...attrs }))
  })

  it('Markdown sets them when given a pre-parsed document', async () => {
    const value = await parseMarkdown('Hello')
    expectRootAttributes(await renderComponent(Markdown, { value, ...attrs }))
  })

  it('Markdown keeps renderer options off the DOM', async () => {
    const html = await renderComponent(Markdown, {
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
  })

  it('MarkdownDocument sets them on the root element', async () => {
    const value = await parseMarkdown('Hello')
    expectRootAttributes(await renderComponent(MarkdownDocument, { value, ...attrs }))
  })

  it('defineMarkdownComponent forwards them', async () => {
    const Defined = defineMarkdownComponent({ name: 'Defined' })
    expectRootAttributes(await renderComponent(Defined, { value: 'Hello', ...attrs }))
  })

  it('defineMarkdownDocumentComponent forwards them', async () => {
    const value = await parseMarkdown('Hello')
    const Defined = defineMarkdownDocumentComponent({ name: 'Defined' })
    expectRootAttributes(await renderComponent(Defined, { value, ...attrs }))
  })
})
