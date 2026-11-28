import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index.ts'
import { renderMarkdown } from 'comark/render'

describe('empty ATX headings', () => {
  it('preserves empty ATX headings instead of dropping them (#525 case 21)', async () => {
    const tree = await parseMarkdown('#\n\n## \n')
    expect(tree.nodes).toEqual([
      ['h1', {}],
      ['h2', {}],
    ])
    const rendered = await renderMarkdown(tree)
    expect(rendered.trim()).toBe('# \n\n##')
    expect((await parseMarkdown(rendered)).nodes).toEqual(tree.nodes)
  })
})
