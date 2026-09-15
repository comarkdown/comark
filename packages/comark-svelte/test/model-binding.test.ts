import { describe, expect, it, vi } from 'vitest'
import { render } from 'svelte/server'
import { parseMarkdown } from 'comark'
import { createModelStore } from 'comark/model'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'

/** Strip Svelte SSR hydration comments from rendered HTML */
function html(body: string): string {
  return body.replace(/<!--[[\]\-\d!]*-->/g, '').replace(/<!---->/g, '')
}

async function renderDoc(markdown: string, props: Record<string, any> = {}) {
  const doc = await parseMarkdown(markdown)
  return html(render(MarkdownDocument, { props: { value: doc, ...props } }).body)
}

describe('Svelte model binding — SSR snapshot', () => {
  it('resolves ::value="data.name" from the model', async () => {
    const model = createModelStore({ data: { data: { name: 'Alice' } } })
    const out = await renderDoc(':input{::value="data.name" type="text"}', { model })
    expect(out).toContain('Alice')
  })

  it('emits controlled value when no model provided (uses data prop)', async () => {
    const out = await renderDoc(':input{::value="data.name" type="text"}', { data: { name: 'Bob' } })
    expect(out).toContain('Bob')
  })

  it('controlled mode: onModelChange fires on write', async () => {
    const onChange = vi.fn()
    const model = createModelStore({ data: { data: { x: 0 } }, onChange })
    model.set('data.x', 7)
    expect(onChange).toHaveBeenCalledWith('data.x', 7, expect.anything())
  })

  it('custom component receives title via ::title binding', async () => {
    const model = createModelStore({ data: { data: { title: 'My Title' } } })
    const out = await renderDoc('::card{::title="data.title"}\ncontent\n::', { model })
    expect(out).toContain('My Title')
  })

  it('unsafe URL is blocked for ::href binding', async () => {
    const model = createModelStore({ data: { data: { url: 'javascript:alert(1)' } } })
    const out = await renderDoc(':a{::href="data.url"}', { model })
    expect(out).not.toContain('javascript:')
  })
})

describe('Svelte model binding — coercion matrix', () => {
  it('number input resolves value from model', async () => {
    const model = createModelStore({ data: { data: { count: 5 } } })
    const out = await renderDoc(':input{::value="data.count" type="number"}', { model })
    expect(out).toContain('5')
  })

  it('checkbox resolves checked from model', async () => {
    const model = createModelStore({ data: { data: { active: true } } })
    const out = await renderDoc(':input{::checked="data.active" type="checkbox"}', { model })
    // Boolean checked attribute renders as checked="" in HTML
    expect(out).toContain('checked')
  })
})
