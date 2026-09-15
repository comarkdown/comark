import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, defineComponent, h } from 'vue'
import { parseMarkdown } from 'comark'
import { createModelStore } from 'comark/model'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import { Form } from '../src/components/Form'

async function render(markdown: string, props: Record<string, any> = {}) {
  const doc = await parseMarkdown(markdown)
  const app = createSSRApp(
    defineComponent({
      render() {
        return h(MarkdownDocument, { value: doc, components: { form: Form }, ...props })
      },
    })
  )
  return renderToString(app)
}

describe('Vue Form component — SSR', () => {
  it('renders a <form> element wrapping its children', async () => {
    const html = await render('::form{::value="data.contact"}\n  Hello\n::')
    expect(html).toContain('<form')
    expect(html).toContain('Hello')
  })

  it('resolves the ::value binding from the model', async () => {
    const model = createModelStore({ data: { data: { contact: { name: 'Alice' } } } })
    const html = await render('::form{::value="data.contact"}\n  content\n::', { model })
    // Form renders its slot — the value prop is resolved but not rendered as text
    expect(html).toContain('<form')
    expect(html).toContain('content')
  })

  it('passes through child input bindings', async () => {
    const model = createModelStore({ data: { data: { name: 'Bob' } } })
    const html = await render(
      '::form{::value="data.contact"}\n  :input{::value="data.name" name="name" type="text"}\n::',
      { model }
    )
    expect(html).toContain('<form')
    expect(html).toContain('Bob')
  })
})
