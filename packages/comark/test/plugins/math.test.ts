import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import math from '../../src/plugins/math'

describe('math plugin', () => {
  it('parses inline and display math without loading katex', async () => {
    const { nodes } = await parseMarkdown('Inline $x^2$ and display $$E = mc^2$$', {
      plugins: [math()],
    })

    expect(JSON.stringify(nodes)).toContain('math')
  })
})
