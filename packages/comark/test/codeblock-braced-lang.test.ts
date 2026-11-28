import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index.ts'
import { renderMarkdown } from 'comark/render'

describe('code block braced language', () => {
  it('preserves {x} as language when not numeric highlights (#525 case 22)', async () => {
    const tree = await parseMarkdown('```{x}\ncode\n```')
    expect(tree.nodes).toEqual([['pre', { language: '{x}' }, ['code', { class: 'language-{x}' }, 'code']]])
    const rendered = await renderMarkdown(tree)
    expect(rendered.trim()).toBe('```{x}\ncode\n```')
  })

  it('still parses numeric highlights without language', async () => {
    const tree = await parseMarkdown('```{1,3-4}\ncode\n```')
    expect(tree.nodes).toEqual([['pre', { highlights: [1, 3, 4] }, ['code', {}, 'code']]])
  })
})
