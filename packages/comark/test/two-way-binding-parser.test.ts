import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index'
import { renderMarkdown } from '../src/render'
import type { ElementNode, Node } from 'comark'

function getAttrs(node: Node): Record<string, unknown> {
  return Array.isArray(node) ? ((node[1] as Record<string, unknown>) ?? {}) : {}
}

describe('parser — ::prop two-way binding attributes', () => {
  it('parses ::value="data.name" on an inline component', async () => {
    const result = await parseMarkdown(':input{::value="data.name"}')
    // Inline-only component unwraps from the paragraph wrapper
    const input = result.nodes[0] as ElementNode
    expect(getAttrs(input)['::value']).toBe('data.name')
  })

  it('parses ::value="data.name" on a block component', async () => {
    const result = await parseMarkdown('::card{::title="data.heading"}\ncontent\n::')
    const card = result.nodes[0] as ElementNode
    expect(getAttrs(card)['::title']).toBe('data.heading')
  })

  it('rejects ::value with no value (boolean shorthand is meaningless for two-way binding)', async () => {
    const result = await parseMarkdown(':input{::value type="text"}')
    const input = result.nodes[0] as ElementNode
    const attrs = getAttrs(input)
    // ::value without = should be silently dropped, not cause a parse error.
    expect(attrs['::value']).toBeUndefined()
    // The other attribute is still parsed.
    expect(attrs.type).toBe('text')
  })

  it('parses ::value="data.name" and ::checked="data.active" together', async () => {
    const result = await parseMarkdown(':input{::value="data.name" ::checked="data.active"}')
    const input = result.nodes[0] as ElementNode
    const attrs = getAttrs(input)
    expect(attrs['::value']).toBe('data.name')
    expect(attrs['::checked']).toBe('data.active')
  })

  it('round-trips ::value="data.name" through renderMarkdown verbatim', async () => {
    const src = '::card{::value="data.count"}\ncontent\n::'
    const doc = await parseMarkdown(src)
    const out = await renderMarkdown(doc)
    expect(out).toContain('::value="data.count"')
  })

  it('single-colon boolean shorthand still works alongside ::value', async () => {
    const result = await parseMarkdown(':input{::value="data.x" disabled}')
    const input = result.nodes[0] as ElementNode
    const attrs = getAttrs(input)
    expect(attrs['::value']).toBe('data.x')
    expect(attrs[':disabled']).toBe('true')
  })
})
