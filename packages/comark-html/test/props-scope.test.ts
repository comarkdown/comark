import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderHtmlFromDocument } from '../src/index'

const UNSAFE = { bad: 'javascript:alert(1)' }

async function render(markdown: string, data: Record<string, unknown> = UNSAFE): Promise<string> {
  return renderHtmlFromDocument(await parseMarkdown(markdown), { data })
}

describe('props scope when every binding is omitted', () => {
  it('does not leak the parent props into children of an element whose bindings are all omitted', async () => {
    const html = await render('::card{title="T"}\n:::div{:href="data.bad"}\n:span[x]{:data-x="props.title"}\n:::\n::')
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('data-x="T"')
  })

  it('exposes the resolved attributes of the middle element to its children', async () => {
    const html = await render(
      '::card{title="T"}\n:::div{:href="data.bad" id="keep"}\n:span[x]{:data-x="props.id"}\n:::\n::'
    )
    expect(html).toContain('data-x="keep"')
    expect(html).not.toContain('data-x="T"')
  })

  it('keeps the parent props visible through bare wrappers', async () => {
    const html = await render('::card{title="T"}\n- :span[x]{:data-x="props.title"}\n::')
    expect(html).toContain('<ul>')
    expect(html).toContain('data-x="T"')
    expect(html).not.toMatch(/<(ul|li)[^>]* title=/)
  })
})
