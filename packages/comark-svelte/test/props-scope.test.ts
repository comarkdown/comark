import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parseMarkdown } from 'comark'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'
import Probe from './test-components/Probe.svelte'

async function renderMarkdown(markdown: string, data: Record<string, unknown> = { bad: 'javascript:alert(1)' }) {
  const value = await parseMarkdown(markdown)
  return render(MarkdownDocument, { props: { value, components: { probe: Probe }, data } }).body
}

describe('MarkdownDocument: props scope when every binding is omitted', () => {
  it('hides the grandparent props from children of an element with all attributes omitted', async () => {
    const html = await renderMarkdown(
      '::::wrap{label="Outer"}\n:::div{:href="data.bad"}\n::probe{:text="props.label"}\n::\n:::\n::::'
    )
    expect(html).toContain('class="probe"')
    expect(html).not.toContain('[Outer]')
  })

  it('exposes the resolved attributes of the middle element to its children', async () => {
    const html = await renderMarkdown(
      '::::wrap{label="Outer"}\n:::div{:href="data.bad" id="keep"}\n::probe{:text="props.id"}\n::\n:::\n::::'
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
