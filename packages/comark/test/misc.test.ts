import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse'

describe('misc', () => {
  it('ignore props with invalid chars, only /^[a-z0-9_-:]+$/gi', async () => {
    const tree = await parseMarkdown(':Alert{id="1"" }')
    expect(tree.nodes).toEqual([['alert', { id: '1' }]])
  })

  describe('boolean attribute coercion', () => {
    it('promotes bare, explicit-true, and explicit-false attrs to :bindings', async () => {
      const tree = await parse('::x{flag other="true" off="false" count="5"}\n::')
      expect((tree.nodes[0] as any)[1]).toEqual({
        ':flag': 'true',
        other: 'true',
        off: 'false',
        count: '5',
      })
    })

    it('promotes unquoted true/false the same way', async () => {
      const tree = await parse('::x{on=true off=false}\n::')
      expect((tree.nodes[0] as any)[1]).toEqual({
        on: 'true',
        off: 'false',
      })
    })

    it('leaves explicit :bindings and non-boolean strings alone', async () => {
      const tree = await parse('::x{:flag="false" label="falsey" zero="0"}\n::')
      expect((tree.nodes[0] as any)[1]).toEqual({
        ':flag': 'false',
        label: 'falsey',
        zero: '0',
      })
    })

    it('applies the same rules to inline components', async () => {
      const tree = await parse(':badge{disabled="false" active}')
      expect((tree.nodes[0] as any)[1]).toEqual({
        disabled: 'false',
        ':active': 'true',
      })
    })
  })
})
