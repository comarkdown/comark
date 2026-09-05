// @vitest-environment happy-dom
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

  it('does not initialize plugins for a pre-parsed document', async () => {
    const plugins: ComarkPlugin[] = [
      {
        name: 'must-not-initialize',
        markdownItPlugins: [
          () => {
            throw new Error('unexpected parser initialization')
          },
        ],
      },
    ]
    await render({ value: { nodes: [['p', {}, 'Already parsed']], frontmatter: {}, meta: {} }, plugins })
    expect(container.textContent).toBe('Already parsed')
  })

  it('keeps its parser when options and plugins are omitted', async () => {
    const first = '# Completed\n\nFirst paragraph.\n\nLast'
    await render({ value: first, streaming: true })
    const heading = container.querySelector('h1')
    await render({ value: first + ' grows', streaming: true })
    expect(container.querySelector('h1')).toBe(heading)
    expect(container.textContent).toContain('Last grows')
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
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
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

  it('discards pending output after replacement with a document', async () => {
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const plugins: ComarkPlugin[] = [
      {
        name: 'deferred',
        async pre() {
          await gate
        },
      },
    ]
    await render({ value: 'Pending', plugins, streaming: true })
    await render({ value: { nodes: [['p', {}, 'Document']], frontmatter: {}, meta: {} }, plugins })
    await act(async () => release())
    expect(container.textContent).toBe('Document')
  })

  it('keeps parser state separate between mounted components', async () => {
    const a = observe()
    const b = observe()
    await act(async () => {
      root.render(
        <>
          <MarkdownClient
            value={'# A\n\nBody'}
            plugins={a.plugins}
            streaming
          />
          <MarkdownClient
            value={'# B\n\nBody'}
            plugins={b.plugins}
            streaming
          />
        </>
      )
    })
    expect(a.trees[0].nodes[0]).not.toBe(b.trees[0].nodes[0])
    expect(container.textContent).toContain('A')
    expect(container.textContent).toContain('B')
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
