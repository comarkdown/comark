import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import template from '@comark/react/plugins/template'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import { templateCases, visibleTemplateText } from '../../../test/fixtures/template'

describe('React templates', () => {
  it.each(templateCases)('renders $expected', async ({ source, data, expected }) => {
    const document = await parseMarkdown(source, { plugins: [template()] })
    const output = renderToString(
      <MarkdownDocument
        value={document}
        data={data}
      />
    )
    expect(visibleTemplateText(output)).toBe(expected)
  })

  it('reevaluates data without mutating the document or invoking inactive components', async () => {
    const document = await parseMarkdown('{% if show %}\n{{ name }}\n{% else %}\n:probe\n{% endif %}', {
      plugins: [template()],
    })
    const components = {
      probe: () => {
        throw new Error('Inactive component invoked')
      },
    }
    for (const name of ['Ada', 'Bob'])
      expect(
        renderToString(
          <MarkdownDocument
            value={document}
            data={{ show: true, name }}
            components={components}
          />
        )
      ).toContain(name)
    expect(document.meta.comarkTemplate).toBe(true)
  })
})
