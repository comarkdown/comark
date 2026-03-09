import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parse } from 'comark'
import math, { Math } from '../math'
import ComarkRenderer from '../../ComarkRenderer.svelte'

/** Strip Svelte SSR hydration comments from rendered HTML */
function html(body: string): string {
  return body.replace(/<!--[[\]\-\d!]*-->/g, '').replace(/<!---->/g, '')
}

describe('Math component (server)', () => {
  it('renders inline math', () => {
    const { body } = render(Math, {
      props: { content: 'x^2', class: 'inline' },
    })
    const output = html(body)
    expect(output).toContain('<span class="math inline">')
    expect(output).toContain('katex')
  })

  it('renders display math', () => {
    const { body } = render(Math, {
      props: { content: 'E = mc^2', class: '' },
    })
    const output = html(body)
    expect(output).toContain('<div class="math block">')
    expect(output).toContain('katex')
  })

  it('handles invalid LaTeX gracefully', () => {
    const { body } = render(Math, {
      props: { content: '\\invalid{', class: '' },
    })
    const output = html(body)
    // Should render fallback rather than throwing
    expect(output).toContain('<div class="math block">')
  })
})

describe('math plugin', () => {
  it('exports the plugin factory', () => {
    expect(typeof math).toBe('function')
    const plugin = math()
    expect(plugin.name).toBe('math')
  })
})

describe('Math + ComarkRenderer integration (server)', () => {
  it('renders inline math from parsed markdown', async () => {
    const tree = await parse('The formula $x^2$ is simple', {
      plugins: [math()],
    })
    const { body } = render(ComarkRenderer, {
      props: { tree, components: { math: Math } },
    })
    const output = html(body)
    expect(output).toContain('<span class="math inline">')
    expect(output).toContain('katex')
    expect(output).toContain('The formula')
  })

  it('renders display math from parsed markdown', async () => {
    const tree = await parse('$$\nE = mc^2\n$$', {
      plugins: [math()],
    })
    const { body } = render(ComarkRenderer, {
      props: { tree, components: { math: Math } },
    })
    const output = html(body)
    expect(output).toContain('<div class="math block">')
    expect(output).toContain('katex')
  })

  it('renders mixed inline and display math', async () => {
    const tree = await parse('Inline $a+b$ and display:\n\n$$\nc^2\n$$', {
      plugins: [math()],
    })
    const { body } = render(ComarkRenderer, {
      props: { tree, components: { math: Math } },
    })
    const output = html(body)
    expect(output).toContain('<span class="math inline">')
    expect(output).toContain('<div class="math block">')
  })
})
