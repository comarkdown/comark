import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

describe('non-string as in React', () => {
  it('does not resolve a component from a non-string as', () => {
    const Probe = () => React.createElement('i', null, 'probe')
    const value = { nodes: [['div', { as: ['Probe'] }, 'hi']], frontmatter: {}, meta: {} } as any
    const html = renderToString(React.createElement(MarkdownDocument, { value, components: { Probe } }))
    expect(html).not.toContain('<i>probe</i>')
    expect(html).toContain('hi')
  })

  it('does not hand a non-string as to a component, which React cannot render as an element type', async () => {
    const Poly = ({ as: As = 'div' }: { as?: any }) => React.createElement(As, null, 'poly')
    for (const markdown of [
      `::poly{:as='["section"]'}\n::`,
      `---\nlist: [section]\n---\n::poly{:as="frontmatter.list"}\n::`,
    ]) {
      const value = await parseMarkdown(markdown)
      const html = renderToString(React.createElement(MarkdownDocument, { value, components: { poly: Poly } }))
      expect(html).toContain('<div>poly</div>')
    }
  })
})
