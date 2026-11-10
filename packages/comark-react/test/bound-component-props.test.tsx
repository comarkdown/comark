import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

describe('non-string as in React', () => {
  it('does not resolve a component from a non-string as', () => {
    const Probe = () => React.createElement('i', null, 'probe')
    const value = { nodes: [['div', { as: ['Probe'] }, 'hi']], frontmatter: {}, meta: {} } as any
    const html = renderToString(React.createElement(MarkdownDocument, { value, components: { Probe } }))
    expect(html).not.toContain('<i>probe</i>')
    expect(html).toContain('hi')
  })
})
