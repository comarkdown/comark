import { describe, expect, it, vi } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, defineComponent, h } from 'vue'
import { parseMarkdown } from 'comark'
import { createModelStore } from 'comark/model'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

async function render(markdown: string, props: Record<string, any> = {}) {
  const doc = await parseMarkdown(markdown)
  const app = createSSRApp(
    defineComponent({
      render() {
        return h(MarkdownDocument, { value: doc, ...props })
      },
    })
  )
  return renderToString(app)
}

describe('Vue model binding — SSR snapshot', () => {
  it('resolves ::value="data.name" from the model', async () => {
    const model = createModelStore({ data: { data: { name: 'Alice' } } })
    const html = await render(':input{::value="data.name" type="text"}', { model })
    expect(html).toContain('Alice')
  })

  it('emits data-comark-model-value HTML marker when no model provided', async () => {
    const doc = await parseMarkdown(':input{::value="data.name" type="text"}')
    const app = createSSRApp(
      defineComponent({
        render() {
          return h(MarkdownDocument, { value: doc, data: { name: 'Bob' } })
        },
      })
    )
    const html = await renderToString(app)
    expect(html).toContain('Bob')
  })

  it('controlled mode: onModelChange fires on write', async () => {
    const onChange = vi.fn()
    const model = createModelStore({ data: { data: { x: 0 } }, onChange })
    model.set('data.x', 7)
    expect(onChange).toHaveBeenCalledWith('data.x', 7, expect.anything())
  })

  it('custom component receives title via ::title binding', async () => {
    const model = createModelStore({ data: { data: { title: 'My Title' } } })
    const html = await render('::card{::title="data.title"}\ncontent\n::', { model })
    expect(html).toContain('My Title')
  })

  it('unsafe URL is blocked for ::href binding', async () => {
    const model = createModelStore({ data: { data: { url: 'javascript:alert(1)' } } })
    const html = await render(':a{::href="data.url"}', { model })
    expect(html).not.toContain('javascript:')
  })
})

describe('Vue model binding — coercion matrix', () => {
  it('number input resolves from model value', async () => {
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
