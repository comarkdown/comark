import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parse } from 'comark'
import Comark from './Comark.svelte'
import ComarkRenderer from './ComarkRenderer.svelte'
import Alert from './test-components/Alert.svelte'

describe('streaming mode', () => {
  it('updates content when markdown prop changes', async () => {
    const screen = render(Comark, { markdown: 'Hello' })

    await expect.element(screen.getByText('Hello')).toBeInTheDocument()

    await screen.rerender({ markdown: 'Hello **World**' })

    await expect.element(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('shows caret during streaming', async () => {
    const screen = render(Comark, {
      markdown: 'Hello',
      streaming: true,
      caret: { class: 'streaming-caret' },
    })

    await expect.element(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.container.querySelector('.streaming-caret')).not.toBeNull()
  })

  it('shows caret with custom class', async () => {
    const screen = render(Comark, {
      markdown: 'Hello',
      streaming: true,
      caret: { class: 'my-cursor' },
    })

    await expect.element(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.container.querySelector('.my-cursor')).not.toBeNull()
  })

  it('does not show caret when streaming is false', async () => {
    const screen = render(Comark, {
      markdown: 'Hello',
      streaming: false,
      caret: true,
    })

    await expect.element(screen.getByText('Hello')).toBeInTheDocument()
    expect(
      screen.container.querySelector('span[style*="currentColor"]'),
    ).toBeNull()
  })

  it('progressively renders content as markdown grows', async () => {
    const screen = render(Comark, { markdown: '# Title' })

    await expect
      .element(screen.getByRole('heading', { name: 'Title', level: 1 }))
      .toBeInTheDocument()

    await screen.rerender({ markdown: '# Title\n\nFirst paragraph' })
    await expect
      .element(screen.getByText('First paragraph'))
      .toBeInTheDocument()

    await screen.rerender({
      markdown: '# Title\n\nFirst paragraph\n\n- item 1',
    })
    await expect
      .element(screen.getByRole('listitem'))
      .toHaveTextContent('item 1')

    await screen.rerender({
      markdown: '# Title\n\nFirst paragraph\n\n- item 1\n- item 2',
    })
    const items = screen.getByRole('listitem')
    expect(items.length).toBe(2)
  })

  it('handles incomplete bold during streaming with autoClose', async () => {
    const screen = render(Comark, {
      markdown: 'Hello **wor',
      streaming: true,
      caret: true,
      options: { autoClose: true },
    })

    await expect.element(screen.getByText(/wor/)).toBeInTheDocument()

    await screen.rerender({
      markdown: 'Hello **world**',
      streaming: false,
      caret: false,
      options: { autoClose: true },
    })

    await expect.element(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('handles incomplete heading during streaming', async () => {
    const screen = render(Comark, {
      markdown: '# Hell',
      streaming: true,
      caret: true,
    })

    await expect
      .element(screen.getByRole('heading', { level: 1 }))
      .toBeInTheDocument()
    await expect.element(screen.getByText(/Hell/)).toBeInTheDocument()

    await screen.rerender({
      markdown: '# Hello World',
      streaming: false,
      caret: false,
    })

    await expect
      .element(screen.getByRole('heading', { name: 'Hello World', level: 1 }))
      .toBeInTheDocument()
  })

  it('handles incomplete MDC component during streaming with autoClose', async () => {
    const screen = render(Comark, {
      markdown: '::alert{type="warning"}\nDang',
      streaming: true,
      caret: true,
      options: { autoClose: true },
      components: { alert: Alert },
    })

    await expect.element(screen.getByRole('alert')).toBeInTheDocument()
    await expect.element(screen.getByText(/Dang/)).toBeInTheDocument()

    await screen.rerender({
      markdown: '::alert{type="warning"}\nDanger zone\n::',
      streaming: false,
      caret: false,
      options: { autoClose: true },
      components: { alert: Alert },
    })

    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Danger zone')
  })

  it('removes caret when streaming ends', async () => {
    const screen = render(Comark, {
      markdown: 'Hello',
      streaming: true,
      caret: { class: 'streaming-caret' },
    })

    await expect.element(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.container.querySelector('.streaming-caret')).not.toBeNull()

    await screen.rerender({
      markdown: 'Hello World',
      streaming: false,
      caret: false,
    })

    await expect.element(screen.getByText('Hello World')).toBeInTheDocument()
    expect(screen.container.querySelector('.streaming-caret')).toBeNull()
  })
})

describe('streaming with ComarkRenderer', () => {
  it('shows and removes caret based on streaming prop', async () => {
    const tree = await parse('Hello **World**')
    const screen = render(ComarkRenderer, {
      tree,
      streaming: true,
      caret: { class: 'streaming-caret' },
    })

    await expect.element(screen.getByText(/Hello/)).toBeInTheDocument()
    expect(screen.container.querySelector('.streaming-caret')).not.toBeNull()

    await screen.rerender({
      tree,
      streaming: false,
      caret: false,
    })

    expect(screen.container.querySelector('.streaming-caret')).toBeNull()
  })

  it('updates tree and reflects new content', async () => {
    let tree = await parse('First')
    const screen = render(ComarkRenderer, { tree })

    await expect.element(screen.getByText('First')).toBeInTheDocument()

    tree = await parse('First\n\nSecond')
    await screen.rerender({ tree })

    await expect.element(screen.getByText('First')).toBeInTheDocument()
    await expect.element(screen.getByText('Second')).toBeInTheDocument()
  })
})
