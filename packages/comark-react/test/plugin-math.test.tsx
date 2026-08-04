import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import math, { Math } from '../src/plugins/math'

// `Math` derives its wrapper markup from the incoming class string, so the
// `class` -> `className` renderer remap is observable under SSR alone —
// `useEffect` (katex) never runs here.

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
})
