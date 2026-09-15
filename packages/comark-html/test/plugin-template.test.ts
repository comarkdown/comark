import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import template from '@comark/html/plugins/template'
import { renderHtmlFromDocument } from '../src/render'
import { templateCases, visibleTemplateText } from '../../../test/fixtures/template'

describe('HTML templates', () => {
  it.each(templateCases)('renders $expected', async ({ source, data, expected }) => {
    const document = await parseMarkdown(source, { plugins: [template()] })
    expect(visibleTemplateText(await renderHtmlFromDocument(document, { data }))).toBe(expected)
  })

  it('escapes interpolated text and never invokes inactive components', async () => {
    const document = await parseMarkdown('{% if show %}\n:probe\n{% else %}\n{{ name }}\n{% endif %}', {
      plugins: [template()],
    })
    const html = await renderHtmlFromDocument(document, {
      data: { show: false, name: '<script>alert(1)</script>' },
      components: {
        probe: () => {
          throw new Error('Inactive component invoked')
        },
      },
    })
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })
})
