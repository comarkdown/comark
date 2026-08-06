import { describe, expect, it } from 'vitest'
import { createMarkdownParser } from '../src/parse'
import type { ComarkPerf } from '../src/types'

interface RecordedSpan {
  name: string
  meta?: Record<string, unknown>
}

/** Minimal recorder capturing span names in completion order. */
function createRecorder() {
  const spans: RecordedSpan[] = []
  const perf: ComarkPerf = {
    span: (name, meta) => () => {
      spans.push({ name, meta })
    },
    measure: (name, fn, meta) => {
      const result = fn()
      if (result instanceof Promise) {
        return result.finally(() => spans.push({ name, meta })) as typeof result
      }
      spans.push({ name, meta })
      return result
    },
  }
  return { perf, spans }
}

const markdown = `---
title: Hello
---

# Hello **world**

::alert
hi
::
`

describe('ParserOptions.perf', () => {
  it('records phase and per-plugin spans in pipeline order', async () => {
    const { perf, spans } = createRecorder()
    const parse = createMarkdownParser({ perf })
    const tree = await parse(markdown)

    expect(tree.frontmatter).toEqual({ title: 'Hello' })

    const names = spans.map((span) => span.name)
    expect(names).toContain('comark:autoclose')
    expect(names).toContain('comark:tokenize')
    expect(names).toContain('comark:nodes')
    // Default plugins with hooks record under their own name.
    expect(names).toContain('comark:pre:frontmatter')

    // Phases come in pipeline order: autoclose → pre hooks → tokenize → nodes → post hooks.
    const order = ['comark:autoclose', 'comark:pre:frontmatter', 'comark:tokenize', 'comark:nodes']
    const indexes = order.map((name) => names.indexOf(name))
    expect(indexes).toEqual([...indexes].sort((a, b) => a - b))
  })

  it('records user plugin pre/post hooks under their plugin name', async () => {
    const { perf, spans } = createRecorder()
    const parse = createMarkdownParser({
      perf,
      plugins: [
        {
          name: 'my-plugin',
          pre: () => {},
          post: () => {},
        },
      ],
    })
    await parse(markdown)

    const names = spans.map((span) => span.name)
    expect(names).toContain('comark:pre:my-plugin')
    expect(names).toContain('comark:post:my-plugin')
  })

  it('produces identical output with and without perf', async () => {
    const { perf } = createRecorder()
    const withPerf = await createMarkdownParser({ perf })(markdown)
    const withoutPerf = await createMarkdownParser()(markdown)
    expect(withPerf).toEqual(withoutPerf)
  })

  it('records spans on the streaming path too', async () => {
    const { perf, spans } = createRecorder()
    const parse = createMarkdownParser({ perf })
    await parse('# Hello', { streaming: true })
    await parse('# Hello\n\nmore **text', { streaming: true })

    expect(spans.filter((span) => span.name === 'comark:tokenize').length).toBe(2)
  })
})
