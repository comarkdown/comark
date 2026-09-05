import React, { act, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ComarkPlugin, MarkdownDocument } from 'comark'
import { MarkdownClient } from '../src/components/MarkdownClient'
import { Markdown } from '../src/components/Markdown'
import type { MarkdownProps } from '../src/components/Markdown'

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
async function render(props: MarkdownProps) {
  await act(async () => {
    root.render(<MarkdownClient {...props} />)
  })
}
function observe() {
  const inputs: string[] = []
  const trees: MarkdownDocument[] = []
  const plugin: ComarkPlugin = {
    name: 'observe-stream',
    pre(state) {
      inputs.push(state.markdown)
    },
    post(state) {
      trees.push(state.tree)
    },
  }
  return { inputs, trees, plugins: [plugin] }
}

describe('MarkdownClient streaming', () => {
  it('reuses completed blocks and parses the whole input when streaming ends', async () => {
    const probe = observe()
    const first = '# Completed\n\nFirst paragraph.\n\nLast paragraph'
    await render({ value: first, streaming: true, plugins: probe.plugins })
    const heading = probe.trees[0].nodes[0]
    const next = first + ' grows'
    await render({ value: next, streaming: true, plugins: probe.plugins })
    expect(probe.inputs[1]).not.toContain('# Completed')
    expect(probe.trees[1].nodes[0]).toBe(heading)
    expect(container.textContent).toContain('Last paragraph grows')

    await render({ value: next, streaming: false, plugins: probe.plugins })
    expect(probe.inputs.at(-1)).toBe(next)
    expect(probe.trees.at(-1)?.nodes[0]).not.toBe(heading)
    expect(container.querySelector('h1')?.textContent).toBe('Completed')
  })

  it('reuses completed blocks through the public Markdown wrapper', async () => {
    const probe = observe()
    const first = '# Completed\n\nFirst paragraph.\n\nLast paragraph'
    await act(async () => {
      root.render(await Markdown({ value: first, streaming: true, plugins: probe.plugins }))
    })
    await act(async () => {
      root.render(await Markdown({ value: first + ' grows', streaming: true, plugins: probe.plugins }))
    })
    expect(probe.inputs[1]).not.toContain('# Completed')
    expect(probe.trees[1].nodes[0]).toBe(probe.trees[0].nodes[0])
    expect(container.textContent).toContain('Last paragraph grows')
  })

  it('recreates the parser for option and plugin changes with unchanged input', async () => {
    const initial = observe()
    const value = '# Heading\n\nParagraph'
    await render({ value, streaming: true, plugins: initial.plugins })
    expect(container.querySelector('h1')?.id).toBe('heading')
    await render({ value, streaming: true, plugins: initial.plugins, options: { headingIds: false } })
    expect(container.querySelector('h1')?.hasAttribute('id')).toBe(false)
    const replacement = observe()
    await render({ value, streaming: true, plugins: replacement.plugins })
    expect(replacement.inputs).toEqual([value])
    expect(container.querySelector('h1')?.id).toBe('heading')
  })

  it('applies unwrap changes and bypasses parsing for documents', async () => {
    const probe = observe()
    await render({ value: 'Paragraph', plugins: probe.plugins })
    expect(container.querySelector('p')).not.toBeNull()
    await render({ value: 'Paragraph', plugins: probe.plugins, unwrap: true })
    expect(container.querySelector('p')).toBeNull()
    const count = probe.inputs.length
    await render({ value: { nodes: [['p', {}, 'Already parsed']], frontmatter: {}, meta: {} }, plugins: probe.plugins })
    expect(probe.inputs).toHaveLength(count)
    expect(container.textContent).toBe('Already parsed')
  })

  it('serializes overlapping plugin work and renders the latest update', async () => {
    const { promise: gate, resolve: release } = Promise.withResolvers<void>()
    let active = 0
    let maxActive = 0
    let calls = 0
    const plugins: ComarkPlugin[] = [
      {
        name: 'deferred',
        async pre() {
          calls++
          active++
          maxActive = Math.max(maxActive, active)
          if (calls === 1) await gate
          active--
        },
      },
    ]
    await render({ value: 'First', plugins, streaming: true })
    await render({ value: 'First grows', plugins, streaming: true })
    expect(calls).toBe(1)
    await act(async () => release())
    expect(maxActive).toBe(1)
    expect(container.textContent).toBe('First grows')
  })

  it('delivers plugin errors to the error boundary', async () => {
    class Boundary extends Component<{ children: React.ReactNode }, { error: boolean }> {
      state = { error: false }
      static getDerivedStateFromError() {
        return { error: true }
      }
      render() {
        return this.state.error ? <p>Parse failed</p> : this.props.children
      }
    }
    const plugins: ComarkPlugin[] = [
      {
        name: 'failure',
        pre() {
          throw new Error('plugin failed')
        },
      },
    ]
    await act(async () => {
      root.render(
        <Boundary>
          <MarkdownClient
            value="Text"
            streaming
            plugins={plugins}
          />
        </Boundary>
      )
    })
    expect(container.textContent).toBe('Parse failed')
  })
})
