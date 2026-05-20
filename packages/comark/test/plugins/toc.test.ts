import { describe, expect, expectTypeOf, it } from 'vitest'
import { parse } from '../../src/parse'
import toc, { type Toc } from '../../src/plugins/toc'

const CONTENT = `# Page Title

## Section One

Some text.

### Subsection

More text.

## Section Two

Even more.
`

describe('toc plugin', () => {
  it('writes a nested table of contents to tree.meta.toc', async () => {
    const tree = await parse(CONTENT, { plugins: [toc({ depth: 3, searchDepth: 3 })] })

    expect(tree.meta.toc.links.map((l) => l.text)).toEqual(['Section One', 'Section Two'])
    expect(tree.meta.toc.links[0].children?.map((l) => l.text)).toEqual(['Subsection'])
  })

  it('narrows tree.meta.toc to Toc at the type level', async () => {
    const tree = await parse(CONTENT, { plugins: [toc()] })

    expectTypeOf(tree.meta.toc).toEqualTypeOf<Toc>()
    expectTypeOf(tree.meta.toc.links).toEqualTypeOf<Toc['links']>()
  })
})
