import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parse } from 'comark'
import mermaid, { Mermaid } from '../../src/plugins/mermaid'
import ComarkRenderer from '../../src/components/ComarkRenderer.svelte'
import Comark from '../../src/components/Comark.svelte'

describe('Mermaid component', () => {
  it('renders a mermaid diagram as SVG', async () => {
    const screen = render(Mermaid, { content: 'graph TD\n    A-->B' })
    const wrapper = screen.container.querySelector<HTMLElement>('.mermaid')!
    expect(wrapper).not.toBeNull()
    expect(wrapper.querySelector('svg')).not.toBeNull()
  })

  it('applies custom class', async () => {
    const screen = render(Mermaid, {
      content: 'graph TD\n    A-->B',
      class: 'my-diagram',
    })
    const wrapper = screen.container.querySelector<HTMLElement>('.mermaid.my-diagram')!
    expect(wrapper).not.toBeNull()
  })

  it('handles invalid mermaid syntax gracefully', async () => {
    const screen = render(Mermaid, { content: 'not valid mermaid' })
    const wrapper = screen.container.querySelector<HTMLElement>('.mermaid')!
    expect(wrapper).not.toBeNull()
  })
})

describe('Mermaid + ComarkRenderer integration', () => {
  it('renders a mermaid code block from parsed markdown', async () => {
    const tree = await parse('```mermaid\ngraph TD\n    A-->B\n```', {
      plugins: [mermaid()],
    })
    const screen = render(ComarkRenderer, {
      tree,
      components: { mermaid: Mermaid },
    })
    const wrapper = screen.container.querySelector<HTMLElement>('.mermaid')!
    expect(wrapper).not.toBeNull()
    expect(wrapper.querySelector('svg')).not.toBeNull()
  })
})

describe('Mermaid + Comark integration', () => {
  it('renders mermaid end-to-end via Comark component', async () => {
    const screen = render(Comark, {
      markdown: '```mermaid\ngraph TD\n    A-->B\n```',
      plugins: [mermaid()],
      components: { mermaid: Mermaid },
    })

    // Wait for Comark to parse and render the mermaid diagram
    await expect.element(screen.getByText(/A/)).toBeInTheDocument()
    const mermaidEl = screen.container.querySelector<HTMLElement>('.mermaid')
    expect(mermaidEl).not.toBeNull()
    expect(mermaidEl!.querySelector('svg')).not.toBeNull()
  })
})
