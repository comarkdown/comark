import { forCases } from '../../../test/fixtures/for'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import binding, { Binding, For, If } from '../src/plugins/binding'
import { nestedIfCases, nestedIfMarkdown } from '../../../test/fixtures/if'

async function renderMarkdown(markdown: string, data: Record<string, unknown>): Promise<string> {
  const document = await parseMarkdown(markdown, { plugins: [binding()] })
  const app = createSSRApp({
    render: () => h(MarkdownDocument, { value: document, components: { Binding, For, If }, data }),
  })
  return renderToString(app)
}

describe('@comark/vue plugins/binding — If component', () => {
  it.each(nestedIfCases)('selects nested branches for $data', async ({ data, expected }) => {
    const html = await renderMarkdown(nestedIfMarkdown, data)
    expect(html.replace(/<[^>]*>/g, '')).toBe(expected)
    expect(html).not.toContain('<template')
  })

  it('wraps the else slot when a comparison fails', async () => {
    const html = await renderMarkdown('::if{:value="data.age" :gte="18" as="section"}\nAdult\n#else\nMinor\n::', {
      age: 17,
    })
    expect(html).toContain('<section>Minor</section>')
    expect(html).not.toContain('Adult')
  })

  it('renders matching branches with an optional wrapper', async () => {
    const markdown = '::if{:value="data.age" :gte="18" as="section"}\nAdult\n::'

    expect(await renderMarkdown(markdown, { age: 21 })).toContain('<section>Adult</section>')
    expect(await renderMarkdown(markdown, { age: 17 })).not.toContain('Adult')
  })
})

it.each(forCases)('For: $name', async ({ markdown, data, expected, absent }) => {
  const output = (await renderMarkdown(markdown, data))
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  for (const text of expected) expect(output).toContain(text)
  for (const text of absent) expect(output).not.toContain(text)
})
