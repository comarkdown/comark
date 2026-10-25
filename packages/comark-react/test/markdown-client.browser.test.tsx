import { afterEach, describe, expect, it } from 'vitest'
import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { parseMarkdown, type ComarkPlugin } from 'comark'
import { MarkdownClient } from '../src/components/MarkdownClient'
import type { MarkdownProps } from '../src/components/Markdown'

let root: Root | undefined
let container: HTMLDivElement

afterEach(() => {
  root?.unmount()
  container?.remove()
})

function mount(initial: MarkdownProps, strict = false): (next: Partial<MarkdownProps>) => void {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  let props = initial
  const update = (next: Partial<MarkdownProps>): void => {
    props = { ...props, ...next }
    const element = <MarkdownClient {...props} />
    root!.render(strict ? <StrictMode>{element}</StrictMode> : element)
  }
  update({})
  return update
}

async function shows(text: string): Promise<void> {
  await expect.poll(() => container.textContent).toBe(text)
}

describe('MarkdownClient streaming', () => {
  it.each([false, true])('reuses the parsed prefix, including Strict Mode: %s', async (strict) => {
    const inputs: string[] = []
    const plugin: ComarkPlugin = {
      name: 'inputs',
      pre(state) { inputs.push(state.markdown) },
    }
    const initial = 'First\n\nSecond\n\nThird'
    const update = mount({ value: initial, streaming: true, plugins: [plugin] }, strict)
    await shows('FirstSecondThird')
    inputs.length = 0
    update({ value: `${initial} grows` })
    await shows('FirstSecondThird grows')
    expect(inputs.length).toBeGreaterThan(0)
    expect(inputs.every((input) => !input.includes('First'))).toBe(true)

    inputs.length = 0
    update({ streaming: false })
    await expect.poll(() => inputs.length).toBeGreaterThan(0)
    expect(inputs).toContain(`${initial} grows`)
    update({ value: 'Replacement', streaming: true })
    await shows('Replacement')
  })

  it('reparses when options, plugins or unwrap change', async () => {
    const update = mount({ value: 'https://example.com\n\nTail', streaming: true, options: { linkify: false } })
    await shows('https://example.comTail')
    expect(container.querySelector('a')).toBeNull()
    update({ options: { linkify: true } })
    await expect.poll(() => container.querySelector('a')?.href).toBe('https://example.com/')
    update({ plugins: [{ name: 'replace', pre(state) { state.markdown = state.markdown.replace('Tail', 'Changed') } }] })
    await shows('https://example.comChanged')
    update({ unwrap: true })
    await expect.poll(() => container.querySelector('p')).toBeNull()
  })

  it('keeps the newest configuration when an initial suspended parse finishes late', async () => {
    const { promise, resolve } = Promise.withResolvers<void>()
    let finished = false
    let started = false
    const update = mount({ value: 'Old', streaming: true, plugins: [{ name: 'slow', async pre() { started = true; await promise; finished = true } }] })
    await expect.poll(() => started).toBe(true)
    update({ value: 'New', plugins: [] })
    await shows('New')
    resolve()
    await expect.poll(() => finished).toBe(true)
    await shows('New')
  })

  it('serializes async post hooks and keeps the previous display while parsing', async () => {
    const { promise, resolve } = Promise.withResolvers<void>()
    let active = 0
    let maxActive = 0
    const started: string[] = []
    const update = mount({ value: 'Ready', streaming: true, plugins: [{
      name: 'slow',
      async post(state) {
        active++
        maxActive = Math.max(active, maxActive)
        started.push(state.markdown)
        if (state.markdown === 'Slow') await promise
        active--
      },
    }] })
    await shows('Ready')
    update({ value: 'Slow' })
    await expect.poll(() => started).toContain('Slow')
    await shows('Ready')
    update({ value: 'Latest' })
    await new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())))
    resolve()
    await shows('Latest')
    expect(maxActive).toBe(1)
  })

  it('bypasses parsing for documents and resumes parsing strings', async () => {
    let calls = 0
    const update = mount({ value: await parseMarkdown('Document'), streaming: true, plugins: [{ name: 'count', pre() { calls++ } }] })
    await shows('Document')
    expect(calls).toBe(0)
    update({ value: 'String' })
    await shows('String')
    expect(calls).toBe(1)
  })
})
