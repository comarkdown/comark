import { expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import type { MarkdownDocument as MarkdownDocumentType, Node } from 'comark'
import { caret, fade } from 'comark/stream'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'

function doc(...nodes: Node[]): MarkdownDocumentType {
  return { nodes, frontmatter: {}, meta: {} }
}

it('fades only new text and keeps fading spans mounted', async () => {
  const done: Node = ['p', {}, 'Done']
  const screen = await render(MarkdownDocument, {
    value: doc(done, ['p', {}, 'Hello']),
    streaming: true,
    effects: [fade()],
  })
  const paragraph = screen.container.querySelector('p')
  const first = [...screen.container.querySelectorAll('.comark-fade')]
  expect(first.map((span) => span.textContent)).toEqual(['Done', 'Hello'])

  await screen.rerender({ value: doc(done, ['p', {}, 'Hello world']) })
  const spans = [...screen.container.querySelectorAll('.comark-fade')]
  expect(spans.map((span) => span.textContent)).toEqual(['Done', 'Hello', ' world'])
  expect(spans[1]).toBe(first[1])
  expect(screen.container.querySelector('p')).toBe(paragraph)
})

it('places the caret after faded text and drops it when streaming ends', async () => {
  const screen = await render(MarkdownDocument, {
    value: doc(['p', {}, 'Hi']),
    streaming: true,
    effects: [fade(), caret({ class: 'cursor' })],
  })
  expect(screen.container.querySelector('p .cursor')).not.toBeNull()
  await screen.rerender({ streaming: false })
  expect(screen.container.querySelector('.cursor')).toBeNull()
  expect(screen.container.textContent).toBe('Hi')
})
