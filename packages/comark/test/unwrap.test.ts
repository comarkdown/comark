import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse'
import { applyUnwrap, resolveUnwrapTags } from '../src/internal/parse/unwrap'

describe('resolveUnwrapTags', () => {
  it('returns an empty list for falsy values', () => {
    expect(resolveUnwrapTags(false)).toEqual([])
    expect(resolveUnwrapTags(undefined)).toEqual([])
    expect(resolveUnwrapTags('')).toEqual([])
  })

  it('defaults to paragraphs for `true`', () => {
    expect(resolveUnwrapTags(true)).toEqual(['p'])
  })

  it('splits on commas and whitespace (MDC style)', () => {
    expect(resolveUnwrapTags('p h1')).toEqual(['p', 'h1'])
    expect(resolveUnwrapTags('p, h1')).toEqual(['p', 'h1'])
    expect(resolveUnwrapTags('  p ,  h1  ')).toEqual(['p', 'h1'])
  })

  it('preserves order (tags are applied sequentially)', () => {
    expect(resolveUnwrapTags('div p')).toEqual(['div', 'p'])
  })

  it('accepts an explicit array verbatim', () => {
    expect(resolveUnwrapTags(['div', 'p'])).toEqual(['div', 'p'])
  })
})

describe('applyUnwrap', () => {
  it('is a no-op when there are no tags to unwrap', () => {
    const nodes = [['p', {}, 'text']]
    expect(applyUnwrap(nodes as any, [])).toBe(nodes)
  })

  it('hoists matched wrapper children in place', () => {
    const nodes = [['p', {}, 'Hello ', ['strong', {}, 'world']]]
    expect(applyUnwrap(nodes as any, ['p'])).toEqual(['Hello ', ['strong', {}, 'world']])
  })

  it('merges adjacent text nodes into a single string', () => {
    const nodes = [
      ['p', {}, 'a'],
      ['p', {}, 'b'],
    ]
    expect(applyUnwrap(nodes as any, ['p'])).toEqual(['ab'])
  })

  it('unwraps tags sequentially, descending one level per tag', () => {
    const nodes = [['div', {}, ['p', {}, 'nested']]]
    expect(applyUnwrap(nodes as any, ['div', 'p'])).toEqual(['nested'])
  })

  it('still unwraps a bare tag when an earlier tag does not match', () => {
    // `div` is absent, but `p` is still applied to the same node.
    const nodes = [['p', {}, 'text']]
    expect(applyUnwrap(nodes as any, ['div', 'p'])).toEqual(['text'])
  })

  it('unwraps any element with the `*` wildcard', () => {
    const nodes = [
      ['h1', {}, 'Head'],
      ['p', {}, 'body'],
    ]
    expect(applyUnwrap(nodes as any, ['*'])).toEqual(['Headbody'])
  })

  it('drops whitespace-only text nodes exposed by unwrapping', () => {
    const nodes = [['div', {}, '\n  ', ['p', {}, 'x'], '\n']]
    expect(applyUnwrap(nodes as any, ['div', 'p'])).toEqual(['x'])
  })

  it('leaves non-matching nodes untouched', () => {
    const nodes = [['h1', {}, 'H'], 'plain text']
    expect(applyUnwrap(nodes as any, ['p'])).toEqual([['h1', {}, 'H'], 'plain text'])
  })
})

describe('parse with unwrap option', () => {
  it('does not unwrap by default', async () => {
    const tree = await parseMarkdown('Hello **world**')
    expect(tree.nodes).toEqual([['p', {}, 'Hello ', ['strong', {}, 'world']]])
  })

  it('unwraps paragraphs with `unwrap: "p"`', async () => {
    const tree = await parseMarkdown('Hello **world**', { unwrap: 'p' })
    expect(tree.nodes).toEqual(['Hello ', ['strong', {}, 'world']])
  })

  it('unwraps paragraphs with `unwrap: true`', async () => {
    const tree = await parseMarkdown('a\n\nb', { unwrap: true })
    // Paragraphs are merged into a single string (MDC behaviour).
    expect(tree.nodes).toEqual(['ab'])
  })

  it('only unwraps matching wrappers, leaving nested paragraphs', async () => {
    const tree = await parseMarkdown('::alert\nHello\n::', { unwrap: 'p', autoUnwrap: false })
    // The alert container survives; only a top-level `p` would be unwrapped.
    expect(tree.nodes).toEqual([['alert', {}, ['p', {}, 'Hello']]])
  })
})
