import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import type { NodeTransform } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import { defineMarkdownDocumentComponent } from '../src/index'

function Pill({ label = '', tone = '', children }: { label?: string; tone?: string; children?: React.ReactNode }) {
  return (
    <span className={`pill ${tone}`}>
      {label}
      {children}
    </span>
  )
}

describe('MarkdownDocument — transformNode', () => {
  it('swaps a node for a component with new props, and children see those props', async () => {
    const value = await parseMarkdown(
      '---\nname: Ada\n---\n::badge{:label="frontmatter.name"}\n:span{:title="props.tone"}\n::'
    )
    const transformNode: NodeTransform = ({ tag, props }) =>
      tag === 'badge' ? { tag: 'pill', props: { ...props, tone: 'info' } } : undefined

    const html = renderToString(
      <MarkdownDocument
        value={value}
        transformNode={transformNode}
        components={{ pill: Pill }}
      />
    )
    expect(html).toContain('<span class="pill info">Ada<span title="info"></span></span>')
  })

  it('runs config-level transforms before instance-level ones', async () => {
    const value = await parseMarkdown('# Title')
    const Renderer = defineMarkdownDocumentComponent({
      transformNode: ({ tag }) => (tag === 'h1' ? { tag: 'h2' } : undefined),
    })
    const html = renderToString(
      <Renderer
        value={value}
        transformNode={({ tag, props }) => (tag === 'h2' ? { props: { ...props, className: 'demoted' } } : undefined)}
      />
    )
    expect(html).toContain('<h2 id="title" class="demoted">Title</h2>')
  })
})
