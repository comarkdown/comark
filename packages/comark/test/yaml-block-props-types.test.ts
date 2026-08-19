import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index'
import type { Node } from 'comark'

// Helper to check if a node is an element with a specific tag
function isElement(node: Node, tag: string): boolean {
  return Array.isArray(node) && node[0] === tag
}

// Helper to get the attrs object of an element
function getAttrs(node: Node): Record<string, unknown> {
  return Array.isArray(node) ? ((node[1] as Record<string, unknown>) ?? {}) : {}
}

describe('YAML block props keep their native types (#364)', () => {
  it('keeps top-level number, boolean, and null scalars typed', async () => {
    const result = await parseMarkdown(
      [
        '::comp',
        '---',
        'a-string: "hello"',
        'a-number: 3',
        'a-negative-number: -1.5',
        'a-true-bool: true',
        'a-false-bool: false',
        'a-null: null',
        '---',
        '::',
      ].join('\n')
    )
    const comp = result.nodes[0] as Node

    expect(isElement(comp, 'comp')).toBe(true)
    const attrs = getAttrs(comp)
    expect(attrs['a-string']).toBe('hello')
    expect(attrs['a-number']).toBe(3)
    expect(attrs['a-negative-number']).toBe(-1.5)
    expect(attrs['a-true-bool']).toBe(true)
    expect(attrs['a-false-bool']).toBe(false)
    expect(attrs['a-null']).toBe(null)
  })

  it('keeps nested object and list values typed, matching top-level scalars', async () => {
    const result = await parseMarkdown(
      ['::comp', '---', 'a-nested-object:', '  x: 1', '  y: true', 'a-list:', '  - 1', '  - two', '  - false', '---', '::'].join(
        '\n'
      )
    )
    const comp = result.nodes[0] as Node
    const attrs = getAttrs(comp)

    expect(attrs['a-nested-object']).toEqual({ x: 1, y: true })
    expect(attrs['a-list']).toEqual([1, 'two', false])
  })

  it('does not coerce explicitly-quoted strings that look like numbers or booleans', async () => {
    const result = await parseMarkdown(
      ['::comp', '---', 'a-quoted-number: "3"', 'a-quoted-bool: "false"', '---', '::'].join('\n')
    )
    const comp = result.nodes[0] as Node
    const attrs = getAttrs(comp)

    expect(attrs['a-quoted-number']).toBe('3')
    expect(attrs['a-quoted-bool']).toBe('false')
  })

  it('does not corrupt a string value that collides with the internal type-encoding prefix', async () => {
    // The internal encoding prefix starts with a NUL byte. A quoted YAML string
    // can contain a NUL byte too, via the `\0` escape. This must not be treated
    // as an encoded value.
    const result = await parseMarkdown('::comp\n---\ntitle: "\\0yaml:true"\n---\n::')
    const comp = result.nodes[0] as Node
    const attrs = getAttrs(comp)

    expect(attrs.title).toBe('\u0000yaml:true')
  })

  it('does not re-parse a quoted string that looks like a JSON array or object', async () => {
    // `processAttributes` re-parses a `{...}`/`[...]` shaped string as JSON for
    // other attribute syntaxes. A YAML-block string must not go through that a
    // second time after it has already been restored to its real string type.
    const result = await parseMarkdown(
      ['::comp', '---', 'tags: "[1,2,3]"', 'title: "{\\"a\\":1}"', '---', '::'].join('\n')
    )
    const comp = result.nodes[0] as Node
    const attrs = getAttrs(comp)

    expect(attrs.tags).toBe('[1,2,3]')
    expect(attrs.title).toBe('{"a":1}')
  })

  it('does not corrupt a nested string value that collides with the internal type-encoding prefix', async () => {
    // The whole props object is encoded as one JSON unit, so a colliding
    // string nested inside it must stay safe too, not only at the top level.
    const result = await parseMarkdown('::comp\n---\nconfig:\n  inner: "\\0yaml:true"\n---\n::')
    const comp = result.nodes[0] as Node
    const attrs = getAttrs(comp)

    expect(attrs.config).toEqual({ inner: '\u0000yaml:true' })
  })

  it('applies the `{`/`[` JSON heuristic only to the syntax that relies on it', async () => {
    // Inline brace attrs have no real type information, so `{...}`/`[...]`
    // shaped values are meant to be parsed as JSON there. A YAML-block string
    // must keep its own real type instead, even on the same component.
    const result = await parseMarkdown('::comp{list="[1,2,3]"}\n---\ntags: "[1,2,3]"\n---\n::')
    const comp = result.nodes[0] as Node
    const attrs = getAttrs(comp)

    expect(attrs.list).toEqual([1, 2, 3])
    expect(attrs.tags).toBe('[1,2,3]')
  })

  it('keeps types through the alternate ```yaml [props] fence delimiter', async () => {
    const result = await parseMarkdown('::comp\n```yaml [props]\ncount: 3\nflag: true\n```\n::')
    const comp = result.nodes[0] as Node
    const attrs = getAttrs(comp)

    expect(attrs.count).toBe(3)
    expect(attrs.flag).toBe(true)
  })

  it('matches the real-world apis-list regression case from the migration issue', async () => {
    const result = await parseMarkdown(
      [
        '::apis-list',
        '---',
        'cta-text: "View APIs"',
        'page-size: 3',
        'pagination: false',
        'grid-columns-breakpoints:',
        '  mobile: 3',
        '  phablet: 3',
        '  tablet: 3',
        '  desktop: 3',
        '---',
        '::',
      ].join('\n')
    )
    const comp = result.nodes[0] as Node
    const attrs = getAttrs(comp)

    expect(attrs).toEqual({
      'cta-text': 'View APIs',
      'page-size': 3,
      pagination: false,
      'grid-columns-breakpoints': { mobile: 3, phablet: 3, tablet: 3, desktop: 3 },
    })
  })
})
