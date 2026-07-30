import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parse } from 'comark'
import { MarkdownParsed } from '../src/components/MarkdownParsed'
import mermaid, { Mermaid } from '../src/plugins/mermaid'

// `Mermaid` derives its wrapper class from the incoming class string, so the
// `class` -> `className` renderer remap is observable under SSR alone —
// `useEffect` (beautiful-mermaid / `document`) never runs here.

describe('@comark/react plugins/mermaid — Mermaid component', () => {
  it('applies custom fence classes to the wrapper', async () => {
    const tree = await parse('```mermaid {.custom}\ngraph TD; A-->B;\n```', { plugins: [mermaid()] })
    const html = renderToString(
      <MarkdownParsed
        value={tree}
        components={{ mermaid: Mermaid }}
      />
    )
    expect(html).toContain('mermaid')
    expect(html).toContain('custom')
  })
})
