import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parseMarkdown } from 'comark'
import mermaid, { Mermaid } from '../../src/plugins/mermaid'
import MarkdownDocument from '../../src/components/MarkdownDocument.svelte'
import Markdown from '../../src/components/Markdown.svelte'

describe('Mermaid component', () => {
  it('renders a mermaid diagram as SVG', async () => {
    const screen = await render(Mermaid, { content: 'graph TD\n    A-->B' })
    const wrapper = screen.container.querySelector<HTMLElement>('.mermaid')!
    expect(wrapper).not.toBeNull()
    expect(wrapper.querySelector('svg')).not.toBeNull()
  })

  it('applies custom class', async () => {
    const screen = await render(Mermaid, {
      content: 'graph TD\n    A-->B',
      class: 'my-diagram',
    })
    const wrapper = screen.container.querySelector<HTMLElement>('.mermaid.my-diagram')!
    expect(wrapper).not.toBeNull()
  })

  it('handles invalid mermaid syntax gracefully', async () => {
    const screen = await render(Mermaid, { content: 'not valid mermaid' })
    const wrapper = screen.container.querySelector<HTMLElement>('.mermaid')!
    expect(wrapper).not.toBeNull()
  })
})

describe('Mermaid + MarkdownDocument integration', () => {
  it('renders a mermaid code block from parsed markdown', async () => {
    const tree = await parseMarkdown('```mermaid\ngraph TD\n    A-->B\n```', {
      plugins: [mermaid()],
    })
    const screen = await render(MarkdownDocument, {
      value: tree,
      components: { mermaid: Mermaid },
    })
    const wrapper = screen.container.querySelector<HTMLElement>('.mermaid')!
    expect(wrapper).not.toBeNull()
    expect(wrapper.querySelector('svg')).not.toBeNull()
  })
})

describe('Mermaid + Markdown integration', () => {
  it('renders mermaid end-to-end via Markdown component', async () => {
    const screen = await render(Markdown, {
      value: '```mermaid\ngraph TD\n    A-->B\n```',
      plugins: [mermaid()],
      components: { mermaid: Mermaid },
    })

    // Wait for Markdown to parse and render the mermaid diagram
    await expect.element(screen.getByText(/A/)).toBeInTheDocument()
    const mermaidEl = screen.container.querySelector<HTMLElement>('.mermaid')
    expect(mermaidEl).not.toBeNull()
    expect(mermaidEl!.querySelector('svg')).not.toBeNull()
  })
})
