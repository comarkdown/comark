import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import { If } from '../src/plugins/binding'

async function renderMarkdown(markdown: string, data: Record<string, unknown>): Promise<string> {
  const document = await parseMarkdown(markdown)
  const app = createSSRApp({
    render: () => h(MarkdownDocument, { value: document, components: { If }, data }),
  })
  return renderToString(app)
}

describe('@comark/vue plugins/binding — If component', () => {
  it('renders matching branches with an optional wrapper', async () => {
    const markdown = '::if{:value="data.age" :gte="18" as="section"}\nAdult\n::'

    expect(await renderMarkdown(markdown, { age: 21 })).toContain('<section>Adult</section>')
    expect(await renderMarkdown(markdown, { age: 17 })).not.toContain('Adult')
  })
})
