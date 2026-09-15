import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import template from '@comark/ansi/plugins/template'
import { renderAnsiFromDocument } from '../src/render'
import { templateCases } from '../../../test/fixtures/template'

describe('ANSI templates', () => {
  it.each(templateCases)('renders $expected', async ({ source, data, expected }) => {
    const document = await parseMarkdown(source, { plugins: [template()] })
    const output = await renderAnsiFromDocument(document, { data, colors: false })
    expect(output.replace(/\s+/g, ' ').trim()).toBe(expected)
  })

  it('sanitizes interpolated control characters', async () => {
    const document = await parseMarkdown('{{ value }}', { plugins: [template()] })
    const output = await renderAnsiFromDocument(document, { data: { value: '\u001b[31mtext\u0007' }, colors: false })
    expect(output).not.toContain('\u001b')
    expect(output).not.toContain('\u0007')
  })
})
