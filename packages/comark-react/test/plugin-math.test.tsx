import { describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import math, { Math } from '../src/plugins/math'

// `Math` derives its wrapper markup from the incoming class string, so the
// `class` -> `className` renderer remap is observable under SSR alone.

describe('@comark/react plugins/math — Math component', () => {
  it('renders inline math as an inline <span class="math inline">', async () => {
    const tree = await parseMarkdown('$x^2$', { plugins: [math()] })
    const html = renderToString(
      <MarkdownDocument
        value={tree}
        components={{ math: Math }}
      />
    )
    expect(html).toContain('<span class="math inline"')
    expect(html).not.toContain('math block')
  })

  it('renders block math as a block <div class="math block">', async () => {
    const tree = await parseMarkdown('$$E = mc^2$$', { plugins: [math()] })
    const html = renderToString(
      <MarkdownDocument
        value={tree}
        components={{ math: Math }}
      />
    )
    expect(html).toContain('<div class="math block"')
  })

  it('shows the escaped TeX source when KaTeX cannot parse it', async () => {
    const tree = await parseMarkdown('$\\frac{<b>}{$', { plugins: [math()] })
    const html = renderToString(
      <MarkdownDocument
        value={tree}
        components={{ math: Math }}
      />
    )
    expect(html).toContain('<span class="math inline">\\frac{&lt;b&gt;}{</span>')
    expect(html).not.toContain('...')
  })

  it('waits for KaTeX in streaming server rendering', async () => {
    vi.resetModules()
    const { Math } = await import('../src/plugins/math')
    const { renderToReadableStream, renderToString } = await import('react-dom/server')

    // Before KaTeX loads, the source stands in for the formula.
    expect(
      renderToString(
        <Math
          content="x^2"
          className="math inline"
        />
      )
    ).toContain('<span class="math inline">x^2</span>')

    const stream = await renderToReadableStream(
      <Math
        content="x^2"
        className="math inline"
      />
    )
    await stream.allReady
    const html = await new Response(stream).text()

    expect(html).toContain('<span class="math inline"><span class="katex">')
  })
})
