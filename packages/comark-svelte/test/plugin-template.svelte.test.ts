import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parseMarkdown } from 'comark'
import template from '@comark/svelte/plugins/template'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'

describe('Svelte reactive templates', () => {
  it('switches branches and repeats fresh loop data without reparsing', async () => {
    const value = await parseMarkdown(
      '{% if visible %}{% for name in names %}{{ name }};{% else %}Empty{% endfor %}{% else %}Hidden{% endif %}',
      { plugins: [template()] }
    )
    const screen = await render(MarkdownDocument, { value, data: { visible: true, names: ['Ada'] } })
    expect(screen.container.textContent).toContain('Ada;')
    await screen.rerender({ data: { visible: true, names: ['Bob', 'Cal'] } })
    expect(screen.container.textContent).toContain('Bob;Cal;')
    expect(screen.container.textContent).not.toContain('Ada')
    await screen.rerender({ data: { visible: true, names: [] } })
    expect(screen.container.textContent).toContain('Empty')
    await screen.rerender({ data: { visible: false, names: ['Ada'] } })
    expect(screen.container.textContent).toContain('Hidden')
    expect(value.meta.comarkTemplate).toBe(true)
  })
})
