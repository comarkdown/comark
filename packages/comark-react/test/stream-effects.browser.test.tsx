import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it } from 'vitest'
import type { MarkdownDocument as MarkdownDocumentType, Node } from 'comark'
import type { StreamEffect } from 'comark/stream'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>
beforeEach(() => {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})
afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

function doc(...nodes: Node[]): MarkdownDocumentType {
  return { nodes, frontmatter: {}, meta: {} }
}

async function render(value: MarkdownDocumentType, props: Record<string, unknown> = {}) {
  await act(async () => {
    root.render(
      <MarkdownDocument
        value={value}
        streaming
        fade={{ pace: false }}
        {...props}
      />
    )
  })
}

it('fades streamed text and keeps existing DOM nodes', async () => {
  const done = doc(['p', {}, 'Done'])
  await render(doc(['p', {}, 'Done'], ['p', {}, 'Hello']))
  const firstParagraph = container.querySelector('p')
  const spans = [...container.querySelectorAll('.comark-fade')]
  expect(spans.map((span) => span.textContent)).toEqual(['Done', 'Hello'])

  await render(doc(done.nodes[0], ['p', {}, 'Hello world']))
  expect(container.querySelector('p')).toBe(firstParagraph)
  const next = [...container.querySelectorAll('.comark-fade')]
  expect(next.map((span) => span.textContent)).toContain(' world')
  // The chunk already fading keeps its element, so its animation does not restart.
  expect(next.find((span) => span.textContent === 'Hello')).toBe(spans[1])
  expect(container.textContent).toBe('DoneHello world')
})

it('does not fade when the document is not streaming', async () => {
  await render(doc(['p', {}, 'Static']), { streaming: false })
  expect(container.querySelector('.comark-fade')).toBeNull()
})

it('runs custom effects and places the caret last', async () => {
  const shout: StreamEffect = {
    name: 'shout',
    apply: (nodes) => [...nodes, ['p', { class: 'shout' }, '!']],
  }
  await render(doc(['p', {}, 'Hi']), { fade: false, effects: [shout], caret: { class: 'cursor' } })
  expect(container.querySelector('.shout')).not.toBeNull()
  expect(container.querySelector('.shout .cursor')).not.toBeNull()
})

it('does not mutate the rendered document', async () => {
  const value = doc(['p', {}, 'Same'])
  const snapshot = JSON.stringify(value)
  await render(value, { caret: true })
  await render({ ...value }, { caret: true })
  expect(JSON.stringify(value)).toBe(snapshot)
  expect(container.querySelectorAll('span[style]').length).toBe(1)
})
