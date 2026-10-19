import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parseMarkdown } from 'comark'
import Markdown from '../src/components/Markdown.svelte'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'
import MarkdownAsync from '../src/async/MarkdownAsync.svelte'

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
  style: 'color: red',
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
  expect(root).toContain('style="color: red"')
  expect(root).toContain('class="comark-content custom"')
}

describe('root element attributes', () => {
  it('MarkdownDocument sets them on the root element', async () => {
    const value = await parseMarkdown('Hello')
    expectRootAttributes(render(MarkdownDocument, { props: { value, class: 'custom', ...attrs } }).body)
  })

  it('Markdown sets them when given a pre-parsed document', async () => {
    const value = await parseMarkdown('Hello')
    expectRootAttributes(render(Markdown, { props: { value, class: 'custom', ...attrs } }).body)
  })

  it('MarkdownAsync sets them on the root element', async () => {
    const { body } = await render(MarkdownAsync, { props: { value: 'Hello **world**', class: 'custom', ...attrs } })
    expectRootAttributes(body)
    expect(body.replace(/<!--[[\]\-\d!]*-->/g, '')).toContain('<strong>world</strong>')
  })

  it('MarkdownAsync keeps renderer options off the DOM', async () => {
    const { body } = await render(MarkdownAsync, {
      props: { value: 'Hello', unwrap: true, data: { a: 1 }, options: {}, plugins: [], 'data-testid': 'answer' },
    })
    const root = rootTag(body)
    expect(root).toContain('data-testid="answer"')
    expect(root).not.toMatch(/unwrap|options|plugins|caret|streaming|components/)
    expect(body).not.toContain('<p>')
  })
})
