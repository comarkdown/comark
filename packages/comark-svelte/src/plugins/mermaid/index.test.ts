import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parse } from 'comark'
import mermaid, { Mermaid } from '../mermaid'
import ComarkRenderer from '../../ComarkRenderer.svelte'

/** Strip Svelte SSR hydration comments from rendered HTML */
function html(body: string): string {
  return body.replace(/<!--[[\]\-\d!]*-->/g, '').replace(/<!---->/g, '')
}

describe('Mermaid component (server)', () => {
  it('renders a mermaid diagram container', () => {
    const { body } = render(Mermaid, {
      props: { content: 'graph TD\n    A-->B' },
    })
    const output = html(body)
    expect(output).toContain('<div class="mermaid')
    // SVG should be rendered
    expect(output).toContain('<svg')
  })

  it('applies custom class', () => {
    const { body } = render(Mermaid, {
      props: { content: 'graph TD\n    A-->B', class: 'my-diagram' },
    })
    const output = html(body)
    expect(output).toContain('mermaid my-diagram')
  })

  it('applies custom dimensions', () => {
    const { body } = render(Mermaid, {
      props: { content: 'graph TD\n    A-->B', width: '500px', height: '300px' },
    })
    const output = html(body)
    expect(output).toContain('width: 500px')
    expect(output).toContain('height: 300px')
  })

  it('handles invalid mermaid syntax gracefully', () => {
    const { body } = render(Mermaid, {
      props: { content: 'not valid mermaid' },
    })
    const output = html(body)
    // Should render the container div even on error
    expect(output).toContain('<div class="mermaid')
  })
})

describe('mermaid plugin', () => {
  it('exports the plugin factory', () => {
    expect(typeof mermaid).toBe('function')
    const plugin = mermaid()
    expect(plugin.name).toBe('mermaid')
  })
})

describe('Mermaid + ComarkRenderer integration (server)', () => {
  it('renders a mermaid code block from parsed markdown', async () => {
    const tree = await parse('```mermaid\ngraph TD\n    A-->B\n```', {
      plugins: [mermaid()],
    })
    const { body } = render(ComarkRenderer, {
      props: { tree, components: { mermaid: Mermaid } },
    })
    const output = html(body)
    expect(output).toContain('<div class="mermaid')
    expect(output).toContain('<svg')
  })
})
