import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parseMarkdown } from 'comark'
import template from '@comark/svelte/plugins/template'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'
import { templateCases, visibleTemplateText } from '../../../test/fixtures/template'

describe('Svelte templates', () => {
  it.each(templateCases)('renders $expected', async ({ source, data, expected }) => {
    const value = await parseMarkdown(source, { plugins: [template()] })
    const { body } = render(MarkdownDocument, { props: { value, data } })
    expect(visibleTemplateText(body)).toBe(expected)
  })
})
