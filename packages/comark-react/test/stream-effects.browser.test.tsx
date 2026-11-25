import React, { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it } from 'vitest'
import type { MarkdownDocument as MarkdownDocumentType, Node } from 'comark'
import { caret, fade, pace } from 'comark/effects'
import type { StreamEffect } from 'comark/effects'
import { Markdown } from '../src/components/Markdown'
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

const fadeEffects = [fade()]

async function render(value: MarkdownDocumentType, props: Record<string, unknown> = {}) {
  await act(async () => {
    root.render(
      <MarkdownDocument
        value={value}
        streaming
        effects={fadeEffects}
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

it('runs effects in order and places the caret last', async () => {
  const shout: StreamEffect = {
    name: 'shout',
    apply: (nodes) => [...nodes, ['p', { class: 'shout' }, '!']],
  }
  await render(doc(['p', {}, 'Hi']), { effects: [shout, caret({ class: 'cursor' })] })
  expect(container.querySelector('.shout')).not.toBeNull()
  expect(container.querySelector('.shout .cursor')).not.toBeNull()
})

it('does not mutate the rendered document', async () => {
  const value = doc(['p', {}, 'Same'])
  const snapshot = JSON.stringify(value)
  const effects = [caret()]
  await render(value, { effects })
  await render({ ...value }, { effects })
  expect(JSON.stringify(value)).toBe(snapshot)
  expect(container.querySelectorAll('span[style]').length).toBe(1)
})

it('keeps index keys without effects so siblings are not remounted', async () => {
  let mounts = 0
  function Counter() {
    useEffect(() => {
      mounts++
    }, [])
    return <b>count</b>
  }
  const components = { counter: Counter }
  await render(doc(['p', {}, 'text ', ['counter', {}]]), { streaming: false, effects: undefined, components })
  await render(doc(['p', {}, ['em', {}, 'text'], ['counter', {}]]), {
    streaming: false,
    effects: undefined,
    components,
  })
  expect(container.querySelector('em')).not.toBeNull()
  expect(mounts).toBe(1)
})

it('drains paced text after streaming ends instead of showing it at once', async () => {
  const text = 'A long paragraph that pace cannot release within a single frame.'
  const effects = [pace({ speed: 1 })]
  const show = (value: string, streaming: boolean) =>
    act(async () => {
      root.render(
        <Markdown
          value={value}
          streaming={streaming}
          effects={effects}
        />
      )
    })
  // The first render shows its input at once; later text is paced.
  await show('A', true)
  await show(text, true)
  expect(container.textContent!.length).toBeLessThan(text.length)
  await show(text, false)
  expect(container.textContent!.length).toBeLessThan(text.length)
})

it('prefers a pre-parsed value over children while streaming', async () => {
  await act(async () => {
    root.render(
      <Markdown
        streaming
        value={doc(['p', {}, 'From value'])}
      >
        From children
      </Markdown>
    )
  })
  expect(container.textContent).toBe('From value')
})
