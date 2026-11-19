import { describe, expect, it } from 'vitest'
import { createMarkdownParser } from '../../src/index'
import type { ComarkSpan, ComarkTracer, ElementNode, Node } from '../../src/types'

describe('alert while streaming', () => {
  it('does not revisit unchanged prefix nodes on incremental appends', async () => {
    let inAlertSpan = false
    let stableTagReads = 0
    const noop: ComarkSpan = { end() {} }
    const tracer: ComarkTracer = {
      startSpan() {
        return noop
      },
      startActiveSpan(name: string, optionsOrFn: any, fn?: any) {
        const run = typeof optionsOrFn === 'function' ? optionsOrFn : fn
        if (name !== 'comark:post:alert') return run(noop)
        inAlertSpan = true
        return run({
          end() {
            inAlertSpan = false
          },
        })
      },
    }

    const parse = createMarkdownParser({ tracer })
    const paragraph = 'Plain paragraph with **bold**.\n\n'
    let input = paragraph.repeat(2)
    const initial = await parse(input, { streaming: true })
    expect(initial.nodes).toHaveLength(2)

    function watchNode(node: Node) {
      if (!Array.isArray(node)) return
      let tag = node[0]
      Object.defineProperty(node, '0', {
        enumerable: true,
        configurable: true,
        get() {
          if (inAlertSpan) stableTagReads++
          return tag
        },
        set(value) {
          tag = value
        },
      })
      for (let i = 2; i < node.length; i++) {
        watchNode(node[i] as Node)
      }
    }

    watchNode(initial.nodes[0])

    input += 'x'
    const updated = await parse(input, { streaming: true })

    expect(stableTagReads).toBe(0)
    expect(updated.nodes[0]).toBe(initial.nodes[0])
    expect((updated.nodes.at(-1) as ElementNode)[2]).toBe('x')
  })

  it('transforms streamed alerts after reused prefix nodes', async () => {
    const parse = createMarkdownParser()
    let streamed = 'First paragraph.\n\n'
    let output = await parse(streamed, { streaming: true })

    for (const chunk of ['> [!', 'NOTE]\n', '> Keep this ', 'alert.\n']) {
      streamed += chunk
      output = await parse(streamed, { streaming: true })
    }

    expect(output.nodes[1][0]).toBe('blockquote')
    expect((output.nodes[1] as ElementNode)[1].as).toBe('note')
    expect((output.nodes[1] as ElementNode)[2]).toBe('Keep this alert.')
  })
})
