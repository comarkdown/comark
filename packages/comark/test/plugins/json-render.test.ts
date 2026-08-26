import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import jsonRender from '../../src/plugins/json-render'

describe('json-render plugin', () => {
  it('expands a small spec into AST nodes', async () => {
    const spec = JSON.stringify({
      root: 'card',
      elements: {
        card: { type: 'Card', props: { title: 'Hello' }, children: ['text'] },
        text: { type: 'Text', props: { content: 'World' } },
      },
    })
    const doc = await parseMarkdown(`\`\`\`json-render\n${spec}\n\`\`\``, { plugins: [jsonRender()] })
    const first = doc.nodes[0] as any
    expect(first[0]).toBe('Card')
    expect(first[2]).toBe('World')
  })

  it('bounds exponential expansion of DAG-shaped specs', async () => {
    // Each element references the next one twice: a ~1KB spec would
    // materialize 2^depth AST nodes without a budget (heap exhaustion).
    const levels = 14
    const elements: Record<string, unknown> = {}
    for (let i = 0; i < levels; i++) {
      elements[`e${i}`] =
        i === levels - 1
          ? { type: 'Text', props: { content: 'leaf' } }
          : { type: 'Stack', props: {}, children: [`e${i + 1}`, `e${i + 1}`] }
    }
    const spec = JSON.stringify({ root: 'e0', elements })
    const doc = await parseMarkdown(`\`\`\`json-render\n${spec}\n\`\`\``, { plugins: [jsonRender()] })
    const first = doc.nodes[0] as any
    // The expansion budget tripped, the throw was caught, and the fence stays inert
    expect(first[0]).toBe('pre')
    expect(first[1].language).toBe('json-render')
  })
})
