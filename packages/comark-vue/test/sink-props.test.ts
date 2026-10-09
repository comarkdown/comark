import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument.ts'

function renderDocument(document: unknown) {
  const app = createSSRApp({
    setup() {
      return () => h(MarkdownDocument, { value: document as any })
    },
  })
  return renderToString(app as any)
}

describe('HTML sink props', () => {
  it('never forwards markdown-authored innerHTML to h()', async () => {
    const document = await parseMarkdown('::div{innerHTML="<img src=x onerror=alert(1)>"}\n::')
    const html = await renderDocument(document)
    expect(html).not.toContain('<img src=x onerror=alert(1)>')
    expect(html).not.toContain('onerror')
  })

  it('drops textContent and dangerouslySetInnerHTML props', async () => {
    const document = await parseMarkdown(':span[safe]{textContent="overlay"}')
    const html = await renderDocument(document)
    expect(html).toContain('safe')
    expect(html).not.toContain('overlay')
  })

  it('never forwards markdown-authored outerHTML to h()', async () => {
    // On the client, Vue sets outerHTML as a DOM property on HTML elements.
    // A later patch then parses the value as markup.
    const document = await parseMarkdown(
      '[x]{outerHTML="<img src=x onerror=alert(1)>"}\n\n<svg><foreignObject><div outerHTML="<img src=y onerror=alert(2)>"></div></foreignObject></svg>'
    )
    const html = await renderDocument(document)
    expect(html).not.toContain('onerror')
    expect(html.toLowerCase()).not.toContain('outerhtml')
  })
})
