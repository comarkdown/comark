import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse.ts'
import { createHeadingIdGenerator, textContent } from '../src/utils/index.ts'
import type { ElementNode, HeadingIdsOption } from '../src/types.ts'

describe('heading id generator', () => {
  it.each<HeadingIdsOption>([true, false, 'nested'])('matches parser allocation with mode %s', async (mode) => {
    const source = '# Title\n\n## Café {#reserved}\n\n### Child\n\n## Café\n\n## Café-1\n\n## !!!\n\n## 123'
    const parsed = await parseMarkdown(source, { headingIds: mode })
    const authored = await parseMarkdown(source, { headingIds: false })
    const nextId = createHeadingIdGenerator(mode)
    const ids = authored.nodes.map((node) => {
      const heading = node as ElementNode
      return nextId(textContent(heading), Number(heading[0].slice(1)), heading[1].id as string | undefined)
    })
    expect(ids).toEqual(parsed.nodes.map((node) => (node as ElementNode)[1].id))
  })

  it('allocates only selected headings and keeps document state isolated', () => {
    const nextId = createHeadingIdGenerator('nested')
    expect(nextId('Visible', 3)).toBe('visible')
    expect(nextId('Visible', 3)).toBe('visible-1')
    expect(createHeadingIdGenerator('nested')('Visible', 3)).toBe('visible')
  })
})
