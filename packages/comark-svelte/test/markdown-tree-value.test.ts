import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parse } from 'comark'
import Markdown from '../src/components/Markdown.svelte'
import MarkdownParsed from '../src/components/MarkdownParsed.svelte'
import MarkdownAsync from '../src/async/MarkdownAsync.svelte'

/** Strip Svelte SSR hydration comments from rendered HTML */
function html(body: string): string {
  return body.replace(/<!--[[\]\-\d!]*-->/g, '').replace(/<!---->/g, '')
}

describe('Markdown value as MarkdownTree', () => {
  it('renders a pre-parsed tree the same as MarkdownParsed', async () => {
    const tree = await parse('# Hello **World**')
    const fromMarkdown = html(render(Markdown, { props: { value: tree } }).body)
    const fromParsed = html(render(MarkdownParsed, { props: { value: tree } }).body)

    expect(fromMarkdown).toContain('<h1')
    expect(fromMarkdown).toContain('Hello <strong>World</strong>')
    expect(fromMarkdown).toBe(fromParsed)
  })

  it('still renders markdown strings after parse settles', async () => {
    // Server render of Markdown only emits once parse has completed in $effect —
    // string path is empty on first SSR tick. MarkdownAsync covers the string path.
    const { body } = await render(MarkdownAsync, {
      props: { value: 'Hello **world**' },
    })
    const output = html(body)
    expect(output).toContain('<p>')
    expect(output).toContain('<strong>world</strong>')
  })

  it('renders an empty tree without crashing', () => {
    const { body } = render(Markdown, {
      props: { value: { nodes: [], frontmatter: {}, meta: {} } },
    })
    expect(html(body)).toBe('<div class="comark-content "></div>')
  })
})

describe('MarkdownAsync value as MarkdownTree', () => {
  it('renders a pre-parsed tree without parsing', async () => {
    const tree = await parse('# Hello **World**')
    const { body } = await render(MarkdownAsync, { props: { value: tree } })
    const output = html(body)
    expect(output).toContain('<h1')
    expect(output).toContain('Hello <strong>World</strong>')
  })

  it('renders a tree the same as MarkdownParsed', async () => {
    const tree = await parse('A paragraph with **bold**')
    const fromAsync = html((await render(MarkdownAsync, { props: { value: tree } })).body)
    const fromParsed = html(render(MarkdownParsed, { props: { value: tree } }).body)
    expect(fromAsync).toBe(fromParsed)
  })
})
