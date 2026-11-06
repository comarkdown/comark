import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index'

describe('misc', () => {
  it('ignore props with invalid chars, only /^[a-z0-9_-:]+$/gi', async () => {
    const tree = await parseMarkdown(':Alert{id="1"" }')
    expect(tree.nodes).toEqual([['alert', { id: '1' }]])
  })

  it('keeps a brace group after an unpaired emphasis marker as text', async () => {
    const doc = await parseMarkdown('Costs 2*{price} today', { autoClose: false })
    expect(doc.nodes).toEqual([['p', {}, 'Costs 2*{price} today']])
  })

  it('parses inline syntax in a brace group kept as text after an unpaired emphasis marker', async () => {
    const escaped = await parseMarkdown('Costs 2* {\\#price} today', { autoClose: false })
    expect(escaped.nodes).toEqual([['p', {}, 'Costs 2* {#price} today']])

    const inline = await parseMarkdown('Costs 2*{a `b` &amp; c} today', { autoClose: false })
    expect(inline.nodes).toEqual([['p', {}, 'Costs 2*{a ', ['code', {}, 'b'], ' & c} today']])
  })

  it('does not recurse per nesting level when restoring brace groups after unpaired emphasis', async () => {
    const depth = 20000
    const doc = await parseMarkdown(`a${'*{'.repeat(depth)}x${'}'.repeat(depth)} t`, { autoClose: false })
    expect(doc.nodes).toHaveLength(1)
    expect(doc.nodes[0]![0]).toBe('p')
  })

  it('reads a brace group after closed emphasis as attributes when text follows', async () => {
    const doc = await parseMarkdown('a *b*{.c} d **e**{.f} g ~~h~~{.i} j', { autoClose: false })
    expect(doc.nodes).toEqual([
      [
        'p',
        {},
        'a ',
        ['em', { class: 'c' }, 'b'],
        ' d ',
        ['strong', { class: 'f' }, 'e'],
        ' g ',
        ['del', { class: 'i' }, 'h'],
        ' j',
      ],
    ])
  })

  describe('boolean attribute coercion', () => {
    it('promotes bare, explicit-true, and explicit-false attrs to :bindings', async () => {
      const tree = await parseMarkdown('::x{flag other="true" off="false" count="5"}\n::')
      expect((tree.nodes[0] as any)[1]).toEqual({
        ':flag': 'true',
        other: 'true',
        off: 'false',
        count: '5',
      })
    })

    it('promotes unquoted true/false the same way', async () => {
      const tree = await parseMarkdown('::x{on=true off=false}\n::')
      expect((tree.nodes[0] as any)[1]).toEqual({
        on: 'true',
        off: 'false',
      })
    })

    it('leaves explicit :bindings and non-boolean strings alone', async () => {
      const tree = await parseMarkdown('::x{:flag="false" label="falsey" zero="0"}\n::')
      expect((tree.nodes[0] as any)[1]).toEqual({
        ':flag': 'false',
        label: 'falsey',
        zero: '0',
      })
    })

    it('applies the same rules to inline components', async () => {
      const tree = await parseMarkdown(':badge{disabled="false" active}')
      expect((tree.nodes[0] as any)[1]).toEqual({
        disabled: 'false',
        ':active': 'true',
      })
    })
  })
})
