import { describe, expect, expectTypeOf, it } from 'vitest'
import { parse } from '../../src/parse'
import summary from '../../src/plugins/summary'
import type { ComarkNode } from '../../src/types'

const CONTENT = `Intro paragraph.

<!-- more -->

After the fold.
`

describe('summary plugin', () => {
  it('writes the nodes before the delimiter to tree.meta.summary', async () => {
    const tree = await parse(CONTENT, { plugins: [summary()] })

    expect(tree.meta.summary).toEqual([['p', {}, 'Intro paragraph.']])
  })

  it('leaves tree.meta.summary undefined when no delimiter is present', async () => {
    const tree = await parse('No fold here.', { plugins: [summary()] })

    expect(tree.meta.summary).toBeUndefined()
  })

  it('narrows tree.meta.summary to ComarkNode[] at the type level', async () => {
    const tree = await parse(CONTENT, { plugins: [summary()] })

    expectTypeOf(tree.meta.summary).toEqualTypeOf<ComarkNode[]>()
  })
})
