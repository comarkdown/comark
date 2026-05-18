import { describe, expect, expectTypeOf, it } from 'vitest'
import { parse } from '../../src/parse'
import headings from '../../src/plugins/headings'

const CONTENT = `# My Page Title

This is the description paragraph.

## Section One
`

describe('headings plugin', () => {
  it('writes title and description to tree.meta', async () => {
    const tree = await parse(CONTENT, { plugins: [headings()] })

    expect(tree.meta.title).toBe('My Page Title')
    expect(tree.meta.description).toBe('This is the description paragraph.')
  })

  it('narrows tree.meta.title and tree.meta.description to (string | undefined)', async () => {
    const tree = await parse(CONTENT, { plugins: [headings()] })

    expectTypeOf(tree.meta.title).toEqualTypeOf<string | undefined>()
    expectTypeOf(tree.meta.description).toEqualTypeOf<string | undefined>()
  })
})

describe('headings plugin — combined with toc/summary', () => {
  it('narrows all three plugins meta keys when used together', async () => {
    const tocMod = (await import('../../src/plugins/toc')).default
    const summaryMod = (await import('../../src/plugins/summary')).default

    const tree = await parse('# Title\n\nIntro.\n', {
      plugins: [headings(), tocMod(), summaryMod()],
    })

    expectTypeOf(tree.meta.title).toEqualTypeOf<string | undefined>()
    expectTypeOf(tree.meta.description).toEqualTypeOf<string | undefined>()
    expectTypeOf(tree.meta.toc).toEqualTypeOf<import('../../src/plugins/toc').Toc>()
    expectTypeOf(tree.meta.summary).toEqualTypeOf<import('../../src/types').ComarkNode[]>()

    // Unknown keys still accessible but typed as `unknown` (safer than the
    // old default of `any`).
    expectTypeOf(tree.meta.somethingElse).toEqualTypeOf<unknown>()
  })
})
