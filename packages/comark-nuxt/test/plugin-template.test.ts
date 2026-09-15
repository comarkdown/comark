import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import template from '@comark/nuxt/plugins/template'
import { MarkdownDocument } from '@comark/vue'
import { templateCases, visibleTemplateText } from '../../../test/fixtures/template'

describe('Nuxt template export and Vue renderer', () => {
  it.each(templateCases)('renders $expected', async ({ source, data, expected }) => {
    const value = await parseMarkdown(source, { plugins: [template()] })
    const output = await renderToString(createSSRApp({ render: () => h(MarkdownDocument, { value, data }) }))
    expect(visibleTemplateText(output)).toBe(expected)
  })
})
