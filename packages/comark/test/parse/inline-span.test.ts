import { describe, expect, it } from 'vitest'
import { parse } from '../../src/parse'

// Regression tests for comarkdown/comark#287 — `comark_inline_span` and link
// labels containing brackets (e.g. LLM citation links like `[[1] Document](#)`): the rule's
// silent branch used to throw "inline rule didn't increment state.pos" via
// `parseLinkLabel` -> `skipToken`, and bare `[text]` inside a label was eaten
// as a span instead of staying literal like plain markdown. Explicit
// `[text]{attrs}` spans still work everywhere, bare spans outside labels too.
describe('comark_inline_span inside link labels (regression)', () => {
  it('keeps a bare bracketed prefix in a link label literal, not a span', async () => {
    const tree = await parse('[[1] Document](#)')
    expect(tree.nodes).toEqual([['p', {}, ['a', { href: '#' }, '[1] Document']]])
  })

  it('keeps a bare nested-bracket label literal, not a span', async () => {
    const tree = await parse('[[link-name] more](https://example.com)')
    expect(tree.nodes).toEqual([['p', {}, ['a', { href: 'https://example.com' }, '[link-name] more']]])
  })

  it('still parses a plain span with a class outside of a link (no regression)', async () => {
    const tree = await parse('[content]{.class}')
    expect(tree.nodes).toEqual([['p', {}, ['span', { class: 'class' }, 'content']]])
  })

  it('still parses an explicit `{attrs}` span nested inside a link label', async () => {
    const tree = await parse('[a [x]{.y} b](#)')
    expect(tree.nodes).toEqual([['p', {}, ['a', { href: '#' }, 'a ', ['span', { class: 'y' }, 'x'], ' b']]])
  })

  it('still parses a bare span outside of a link label (no regression)', async () => {
    const tree = await parse('Hello [World]')
    expect(tree.nodes).toEqual([['p', {}, 'Hello ', ['span', {}, 'World']]])
  })
})
