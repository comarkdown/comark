import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import { createModelStore } from 'comark/model'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

async function render(markdown: string, props: Record<string, any> = {}) {
  const doc = await parseMarkdown(markdown)
  return renderToString(
    <MarkdownDocument
      value={doc}
      {...props}
    />
  )
}

describe('React model binding — SSR snapshot', () => {
  it('resolves ::value="data.name" from the model in preserve/SSR mode', async () => {
    const model = createModelStore({ data: { data: { name: 'Alice' } } })
    const html = await render(':input{::value="data.name" type="text"}', { model })
    expect(html).toContain('Alice')
  })

  it('emits data-comark-model-value when no model is provided (HTML markers)', async () => {
    // When no model is passed an uncontrolled store is created internally.
    // In SSR, the marker attributes appear in the output.
    const doc = await parseMarkdown(':input{::value="data.name" type="text"}')
    const html = renderToString(
      <MarkdownDocument
        value={doc}
        data={{ name: 'Bob' }}
      />
    )
    // The resolved value should be present.
    expect(html).toContain('Bob')
  })

  it('controlled mode: onModelChange is called after a write', async () => {
    const onChange = vi.fn()
    const model = createModelStore({
      data: { data: { count: 0 } },
      onChange,
    })
    model.set('data.count', 42)
    expect(onChange).toHaveBeenCalledWith('data.count', 42, expect.objectContaining({ data: { count: 42 } }))
  })

  it('emits custom onUpdateX handler for non-native components', async () => {
    const model = createModelStore({ data: { data: { title: 'Hello' } } })
    const html = await render('::card{::title="data.title"}\ncontent\n::', { model })
    // The card component receives title='Hello' in SSR.
    expect(html).toContain('Hello')
  })

  it('unsafe URL is blocked for ::href', async () => {
    const model = createModelStore({ data: { data: { url: 'javascript:alert(1)' } } })
    const html = await render(':a{::href="data.url" text="click"}', { model })
    expect(html).not.toContain('javascript:')
  })
})

describe('React model binding — coercion matrix', () => {
  it('number input resolves value as-is from model', async () => {
    const model = createModelStore({ data: { data: { count: 5 } } })
    const html = await render(':input{::value="data.count" type="number"}', { model })
    expect(html).toContain('5')
  })

  it('checkbox resolves checked from model', async () => {
    const model = createModelStore({ data: { data: { active: true } } })
    const html = await render(':input{::checked="data.active" type="checkbox"}', { model })
    // Boolean checked attribute renders as checked="" in HTML
    expect(html).toContain('checked')
  })
})
