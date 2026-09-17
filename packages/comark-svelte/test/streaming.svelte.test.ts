import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parseMarkdown } from 'comark'
import type { ComarkPlugin } from 'comark'
import Markdown from '../src/components/Markdown.svelte'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'
import Alert from './test-components/Alert.svelte'

describe('streaming mode', () => {
  it('updates content when markdown prop changes', async () => {
    const screen = await render(Markdown, { value: 'Hello' })

    await expect.element(screen.getByText('Hello')).toBeInTheDocument()

    await screen.rerender({ value: 'Hello **World**' })

    await expect.element(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('shows caret during streaming', async () => {
    const screen = await render(Markdown, {
      value: 'Hello',
      streaming: true,
      caret: { class: 'streaming-caret' },
    })

    await expect.element(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.container.querySelector('.streaming-caret')).not.toBeNull()
  })

  it('shows caret with custom class', async () => {
    const screen = await render(Markdown, {
      value: 'Hello',
      streaming: true,
      caret: { class: 'my-cursor' },
    })

    await expect.element(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.container.querySelector('.my-cursor')).not.toBeNull()
  })

  it('does not show caret when streaming is false', async () => {
    const screen = await render(Markdown, {
      value: 'Hello',
      streaming: false,
      caret: true,
    })

    await expect.element(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.container.querySelector('span[style*="currentColor"]')).toBeNull()
  })

  it('progressively renders content as markdown grows', async () => {
    const screen = await render(Markdown, { value: '# Title' })

    await expect.element(screen.getByRole('heading', { name: 'Title', level: 1 })).toBeInTheDocument()

    await screen.rerender({ value: '# Title\n\nFirst paragraph' })
    await expect.element(screen.getByText('First paragraph')).toBeInTheDocument()

    await screen.rerender({
      value: '# Title\n\nFirst paragraph\n\n- item 1',
    })
    await expect.element(screen.getByRole('listitem')).toHaveTextContent('item 1')

    await screen.rerender({
      value: '# Title\n\nFirst paragraph\n\n- item 1\n- item 2',
    })
    const items = screen.getByRole('listitem')
    expect(items.length).toBe(2)
  })

  it('handles incomplete bold during streaming with autoClose', async () => {
    const screen = await render(Markdown, {
      value: 'Hello **wor',
      streaming: true,
      caret: true,
      options: { autoClose: true },
    })

    await expect.element(screen.getByText(/wor/)).toBeInTheDocument()

    await screen.rerender({
      value: 'Hello **world**',
      streaming: false,
      caret: false,
      options: { autoClose: true },
    })

    await expect.element(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('handles incomplete heading during streaming', async () => {
    const screen = await render(Markdown, {
      value: '# Hell',
      streaming: true,
      caret: true,
    })

    await expect.element(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await expect.element(screen.getByText(/Hell/)).toBeInTheDocument()

    await screen.rerender({
      value: '# Hello World',
      streaming: false,
      caret: false,
    })

    await expect.element(screen.getByRole('heading', { name: 'Hello World', level: 1 })).toBeInTheDocument()
  })

  it('handles incomplete MDC component during streaming with autoClose', async () => {
    const screen = await render(Markdown, {
      value: '::alert{type="warning"}\nDang',
      streaming: true,
      caret: true,
      options: { autoClose: true },
      components: { alert: Alert },
    })

    await expect.element(screen.getByRole('alert')).toBeInTheDocument()
    await expect.element(screen.getByText(/Dang/)).toBeInTheDocument()

    await screen.rerender({
      value: '::alert{type="warning"}\nDanger zone\n::',
      streaming: false,
      caret: false,
      options: { autoClose: true },
      components: { alert: Alert },
    })

    await expect.element(screen.getByRole('alert')).toHaveTextContent('Danger zone')
  })

  it('removes caret when streaming ends', async () => {
    const screen = await render(Markdown, {
      value: 'Hello',
      streaming: true,
      caret: { class: 'streaming-caret' },
    })

    await expect.element(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.container.querySelector('.streaming-caret')).not.toBeNull()

    await screen.rerender({
      value: 'Hello World',
      streaming: false,
      caret: false,
    })

    await expect.element(screen.getByText('Hello World')).toBeInTheDocument()
    expect(screen.container.querySelector('.streaming-caret')).toBeNull()
  })
})

describe('streaming with MarkdownDocument', () => {
  it('shows and removes caret based on streaming prop', async () => {
    const tree = await parseMarkdown('Hello **World**')
    const screen = await render(MarkdownDocument, {
      value: tree,
      streaming: true,
      caret: { class: 'streaming-caret' },
    })

    await expect.element(screen.getByText(/Hello/)).toBeInTheDocument()
    expect(screen.container.querySelector('.streaming-caret')).not.toBeNull()

    await screen.rerender({
      value: tree,
      streaming: false,
      caret: false,
    })

    expect(screen.container.querySelector('.streaming-caret')).toBeNull()
  })

  it('updates tree and reflects new content', async () => {
    let tree = await parseMarkdown('First')
    const screen = await render(MarkdownDocument, { value: tree })

    await expect.element(screen.getByText('First')).toBeInTheDocument()

    tree = await parseMarkdown('First\n\nSecond')
    await screen.rerender({ value: tree })

    await expect.element(screen.getByText('First')).toBeInTheDocument()
    await expect.element(screen.getByText('Second')).toBeInTheDocument()
  })
})

describe('parse failures', () => {
  it('ignores a stale parse when a newer one rejects', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => (release = resolve))
    const slow: ComarkPlugin = { name: 'slow', post: () => gate }
    const failing: ComarkPlugin = {
      name: 'failing',
      post() {
        throw new Error('plugin exploded')
      },
    }
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const screen = await render(Markdown, { value: 'Good' })
    await expect.element(screen.getByText('Good')).toBeInTheDocument()

    await screen.rerender({ value: 'Stale', plugins: [slow] })
    await screen.rerender({ value: 'Newer', plugins: [failing] })
    release()
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(screen.container.textContent).toContain('Good')
    expect(screen.container.textContent).not.toContain('Stale')
  })
})
