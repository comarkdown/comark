import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

function Probe({ text = '' }: { text?: string }) {
  return <i className="probe">{`[${text}]`}</i>
}

async function renderMarkdown(markdown: string, props: Record<string, any> = {}) {
  const tree = await parseMarkdown(markdown)
  return renderToString(
    <MarkdownDocument
      value={tree}
      components={{ probe: Probe }}
      {...props}
    />
  )
}

describe('MarkdownDocument: props scope when every attribute is omitted', () => {
  it('hides the grandparent props from children of an element with all attributes omitted', async () => {
    const html = await renderMarkdown(
      '::::wrap{label="Outer"}\n:::div{:data-x="{{ data.nope }}"}\n::probe{:text="props.label"}\n::\n:::\n::::',
      { data: {} }
    )
    expect(html).toContain('class="probe"')
    expect(html).not.toContain('[Outer]')
  })

  it('exposes the resolved attributes of the middle element to its children', async () => {
    const html = await renderMarkdown(
      '::::wrap{label="Outer"}\n:::div{:data-x="{{ data.nope }}" id="keep"}\n::probe{:text="props.id"}\n::\n:::\n::::',
      { data: {} }
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
