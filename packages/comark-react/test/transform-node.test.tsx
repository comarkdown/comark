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

  it('renders a node turned into a native void element without its children', async () => {
    const value = await parseMarkdown('Type here')
    const html = renderToString(
      <MarkdownDocument
        value={value}
        transformNode={({ tag }) =>
          tag === 'p' ? { tag: 'input', props: { placeholder: 'x', children: 'y' } } : undefined
        }
      />
    )
    expect(html).toContain('<input placeholder="x"/>')
  })

  it('keeps children for a custom component mapped to a void tag', async () => {
    const value = await parseMarkdown('Caption')
    const Figure = ({ children }: { children?: React.ReactNode }) => <figure>{children}</figure>
    const html = renderToString(
      <MarkdownDocument
        value={value}
        components={{ img: Figure }}
        transformNode={({ tag }) => (tag === 'p' ? { tag: 'img' } : undefined)}
      />
    )
    expect(html).toContain('<figure>Caption</figure>')
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
