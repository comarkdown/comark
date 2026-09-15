import { describe, expect, it, vi } from 'vitest'
import { parseMarkdown } from 'comark'
import { createModelStore } from 'comark/model'
import { resolveAttributes } from 'comark/utils'

describe('Angular model binding — attribute resolution', () => {
  it('resolves ::value="data.name" from the model', async () => {
    const model = createModelStore({ data: { data: { name: 'Alice' } } })
    const doc = await parseMarkdown(':input{::value="data.name" type="text"}')
    const node = doc.nodes[0] as any
    // Walk to the input element (inside the paragraph)
    const inputNode = Array.isArray(node[2]) ? node[2] : node
    const nodeProps = inputNode[1] ?? {}
    const renderData = { frontmatter: {}, meta: {}, data: {}, props: {} }
    const resolved = resolveAttributes(nodeProps, renderData, { parseJson: true, model })
    expect(resolved.value).toBe('Alice')
  })

  it('controlled mode: onModelChange fires on write', () => {
    const onChange = vi.fn()
    const model = createModelStore({ data: { data: { x: 0 } }, onChange })
    model.set('data.x', 7)
    expect(onChange).toHaveBeenCalledWith('data.x', 7, expect.anything())
  })

  it('custom component gets ::title="data.title" resolved', async () => {
    const model = createModelStore({ data: { data: { title: 'My Title' } } })
    const doc = await parseMarkdown('::card{::title="data.title"}\ncontent\n::')
    const cardNode = doc.nodes[0] as any
    const nodeProps = cardNode[1] ?? {}
    const renderData = { frontmatter: {}, meta: {}, data: {}, props: {} }
    const resolved = resolveAttributes(nodeProps, renderData, { parseJson: true, model })
    expect(resolved.title).toBe('My Title')
  })

  it('unsafe URL is blocked for ::href binding', () => {
    const model = createModelStore({ data: { data: { url: 'javascript:alert(1)' } } })
    // Directly test resolveAttributes with the ::href node prop
    const nodeProps = { '::href': 'data.url' }
    const renderData = { frontmatter: {}, meta: {}, data: {}, props: {} }
    const resolved = resolveAttributes(nodeProps, renderData, { parseJson: true, model })
    expect(String(resolved.href ?? '')).not.toContain('javascript:')
  })

  it('number input resolves value from model', async () => {
    const model = createModelStore({ data: { data: { count: 5 } } })
    const doc = await parseMarkdown(':input{::value="data.count" type="number"}')
    const node = doc.nodes[0] as any
    const inputNode = Array.isArray(node[2]) ? node[2] : node
    const nodeProps = inputNode[1] ?? {}
    const renderData = { frontmatter: {}, meta: {}, data: {}, props: {} }
    const resolved = resolveAttributes(nodeProps, renderData, { parseJson: true, model })
    expect(resolved.value).toBe(5)
  })

  it('per-instance isolation: two stores do not share state', () => {
    const m1 = createModelStore({ data: { data: { x: 1 } } })
    const m2 = createModelStore({ data: { data: { x: 99 } } })
    expect(m1.get('data.x')).toBe(1)
    expect(m2.get('data.x')).toBe(99)
    m1.set('data.x', 42)
    expect(m2.get('data.x')).toBe(99)
  })
})
