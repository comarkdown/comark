import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderHtmlFromDocument } from '../src/index'

async function render(markdown: string, data: Record<string, unknown> = {}): Promise<string> {
  return renderHtmlFromDocument(await parseMarkdown(markdown), { data })
}

describe('props scope when every attribute is omitted', () => {
  it('does not leak the parent props onto a child whose bindings all resolve to nothing', async () => {
    const html = await render('::card{title="T" id="p"}\n:span[x]{:data-x="{{ data.nope }}"}\n::')
    expect(html).toContain('<card title="T" id="p">')
    expect(html).toContain('<span>x</span>')
  })

  it('does not leak the parent props onto an element whose unsafe URL is omitted', async () => {
    const html = await render('::card{title="T"}\n:a[x]{:href="{{ data.bad }}"}\n::', { bad: 'javascript:alert(1)' })
    expect(html).not.toContain('javascript:')
    expect(html).toContain('<a>x</a>')
  })

  it('keeps the resolved attributes and still hides the parent props', async () => {
    const html = await render('::card{title="T"}\n:span[x]{:data-x="{{ data.nope }}" id="keep"}\n::')
    expect(html).toContain('<span id="keep">x</span>')
  })

  it('keeps the parent props visible through bare wrappers', async () => {
    const html = await render('::card{title="T"}\n- :span[x]{:data-x="props.title"}\n::')
    expect(html).toContain('<ul>')
    expect(html).toContain('data-x="T"')
    expect(html).not.toMatch(/<(ul|li)[^>]* title=/)
  })
})
