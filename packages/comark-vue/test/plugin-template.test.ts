import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import template from '@comark/vue/plugins/template'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import { templateCases, visibleTemplateText } from '../../../test/fixtures/template'

describe('Vue templates', () => {
  it.each(templateCases)('renders $expected', async ({ source, data, expected }) => {
    const document = await parseMarkdown(source, { plugins: [template()] })
    const output = await renderToString(createSSRApp({ render: () => h(MarkdownDocument, { value: document, data }) }))
    expect(visibleTemplateText(output)).toBe(expected)
  })
})
