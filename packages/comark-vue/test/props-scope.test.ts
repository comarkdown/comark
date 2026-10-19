import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

const Probe = defineComponent({
  props: { text: { type: String, default: '' } },
  setup(props) {
    return () => h('i', { class: 'probe' }, `[${props.text}]`)
  },
})

async function renderMarkdown(markdown: string, props: Record<string, any> = {}) {
  const tree = await parseMarkdown(markdown)
  const app = createSSRApp({
    setup: () => () => h(MarkdownDocument, { value: tree, components: { probe: Probe }, ...props }),
  })
  return renderToString(app as any)
}

describe('MarkdownDocument: props scope when every binding is omitted', () => {
  it('hides the grandparent props from children of an element with all attributes omitted', async () => {
    const html = await renderMarkdown(
      '::::wrap{label="Outer"}\n:::div{:href="data.bad"}\n::probe{:text="props.label"}\n::\n:::\n::::',
      { data: { bad: 'javascript:alert(1)' } }
    )
    expect(html).toContain('class="probe"')
    expect(html).not.toContain('[Outer]')
  })

  it('exposes the resolved attributes of the middle element to its children', async () => {
    const html = await renderMarkdown(
      '::::wrap{label="Outer"}\n:::div{:href="data.bad" id="keep"}\n::probe{:text="props.id"}\n::\n:::\n::::',
      { data: { bad: 'javascript:alert(1)' } }
    )
    expect(html).toContain('[keep]')
    expect(html).not.toContain('[Outer]')
  })

  it('keeps the parent props visible through bare wrappers', async () => {
    const html = await renderMarkdown('::::wrap{label="Outer"}\n- :probe{:text="props.label"}\n::::')
    expect(html).toContain('<ul>')
    expect(html).toContain('[Outer]')
  })
})
