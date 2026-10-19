import { describe, expect, it, vi } from 'vitest'
import type { NodeRenderData } from '../src/types.ts'
import { REJECTED_PROP } from '../src/internal/props-validation.ts'
import { UNRESOLVED, interpolateProp } from '../src/internal/stringify/interpolate.ts'

const makeRenderData = (overrides: Partial<NodeRenderData> = {}): NodeRenderData => ({
  frontmatter: {},
  meta: {},
  data: {},
  props: {},
  ...overrides,
})

const withData = (data: Record<string, unknown>): NodeRenderData => makeRenderData({ data })
const run = (value: string, data: Record<string, unknown> = {}, name = 'title') =>
  interpolateProp(name, value, withData(data))

describe('interpolateProp (resolution)', () => {
  it.each([
    ['/docs/{{ data.slug }}', '/docs/intro'],
    ['/docs/{{ data.slug }}/overview', '/docs/intro/overview'],
    ['{{ data.slug }}/overview', 'intro/overview'],
    ['{{data.slug}}-{{ data.slug }}', 'intro-intro'],
    ['{{ data.items.0.name }}', 'first'],
  ])('replaces placeholders in %s', (value, expected) => {
    expect(run(value, { slug: 'intro', items: [{ name: 'first' }] })).toBe(expected)
  })

  it('reads all four roots', () => {
    const renderData = { frontmatter: { a: 'A' }, meta: { b: 'B' }, data: { c: 'C' }, props: { d: 'D' } }
    expect(interpolateProp('title', '{{ frontmatter.a }}{{ meta.b }}{{ data.c }}{{ props.d }}', renderData)).toBe(
      'ABCD'
    )
  })

  it.each([
    ['x-{{ data.missing || fallback }}', 'x-fallback'],
    ['x-{{ data.missing || }}', 'x-'],
    ["x-{{ data.missing || 'q' }}", "x-'q'"],
    ['x-{{ data.missing || a || b }}', 'x-a || b'],
    ['x-{{ data.slug || fallback }}', 'x-intro'],
    ['x-{{ data.missing }}', 'x-'],
  ])('handles defaults in %s', (value, expected) => {
    expect(run(value, { slug: 'intro' })).toBe(expected)
  })

  it('inserts 0, false and empty strings without using the default', () => {
    expect(run('{{ data.n || d }}|{{ data.f || d }}|{{ data.s || d }}', { n: 0, f: false, s: '' })).toBe('0|false|')
  })

  it('stringifies numbers and booleans', () => {
    expect(run('a{{ data.n }}{{ data.t }}', { n: 1.5, t: true })).toBe('a1.5true')
  })

  it.each([
    ['object', {}],
    ['array', []],
    ['null', null],
    ['undefined', undefined],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['function', () => 'x'],
  ])('treats a %s value as unresolved', (_, value) => {
    expect(run('a{{ data.v || d }}', { v: value })).toBe('ad')
    expect(run('a{{ data.v }}', { v: value })).toBe('a')
  })

  it('returns UNRESOLVED only for a sole placeholder without a default', () => {
    expect(run('{{ data.x }}')).toBe(UNRESOLVED)
    expect(run('{{ data.x || d }}')).toBe('d')
    expect(run('{{ data.x || }}')).toBe('')
    expect(run('{{ data.x }}!')).toBe('!')
    expect(run('{{ data.x }}{{ data.y }}')).toBe('')
  })

  it('never calls functions or reads inherited methods', () => {
    const fn = vi.fn(() => 'called')
    expect(run('{{ data.fn || d }}', { fn })).toBe('d')
    expect(run('{{ data.toString || d }}')).toBe('d')
    expect(fn).not.toHaveBeenCalled()
  })

  it('treats a throwing getter as unresolved', () => {
    const data = {
      get boom(): string {
        throw new Error('boom')
      },
    }
    expect(run('a{{ data.boom || d }}', data)).toBe('ad')
  })

  it('does not expand placeholders inside inserted values', () => {
    expect(run('{{ data.a }}', { a: '{{ data.secret }}', secret: 's' })).toBe('{{ data.secret }}')
  })

  it('collapses line breaks and removes control characters', () => {
    expect(run('{{ data.a }}', { a: 'a\r\n\t b' })).toBe('a  b')
    expect(run('{{ data.a }}', { a: 'a\n\n\nb' })).toBe('a b')
    expect(run('{{ data.a }}', { a: 'a\u0000b\u0085c\u202Ed\u2066e\u007Ff' })).toBe('abcdef')
    expect(run('{{ data.x || d\u0000e }}')).toBe('de')
  })

  it('returns UNRESOLVED when the output is too long, without building it', () => {
    const start = performance.now()
    expect(run('a{{ data.a }}', { a: 'x'.repeat(5_000_000) })).toBe(UNRESOLVED)
    expect(run('{{ data.a }}{{ data.a }}', { a: 'x'.repeat(3000) })).toBe(UNRESOLVED)
    expect(performance.now() - start).toBeLessThan(200)
  })
})

describe('interpolateProp (fall through)', () => {
  it.each([
    'plain text',
    'only {{ open',
    'only close }}',
    '{{ x }}',
    '{{ other.x }}',
    '{{ a | b }}',
    '{{ data.a b }}',
    '{{ }}',
    '{{ || d }}',
    '{{ data.a..b }}',
    '{{ data.items[0] }}',
    '{{ data.a"b }}',
    "{{ data.a'b }}",
    '{{ {{ data.x }} }}',
    '{{ data.__proto__ }}',
    '{{ data.constructor }}',
    '{{ data.a.prototype }}',
    '"{{ data.x }}"',
    '{{ data.x }} {{ unterminated',
    `${'x'.repeat(4090)}{{ data.x }}`,
  ])('returns undefined for %s', (value) => {
    expect(run(value, { x: 'v' })).toBeUndefined()
  })

  it.each(['key', 'ref', 'is', 'as', 'style', '.style', '^style', 'STYLE', ':href'])(
    'returns undefined for the name %s',
    (name) => {
      expect(interpolateProp(name, 'a{{ data.x }}', withData({ x: 'v' }))).toBeUndefined()
    }
  )

  it('returns quickly for inputs over the length gate', () => {
    const start = performance.now()
    expect(run(`{{${' '.repeat(100000)}`)).toBeUndefined()
    expect(run('{{ '.repeat(1500))).toBeUndefined()
    expect(performance.now() - start).toBeLessThan(200)
  })

  it('returns quickly for hostile shapes under the length gate', () => {
    const start = performance.now()
    expect(run('{{ data.x }}'.repeat(340), { x: 'v' })).toBe('v'.repeat(340))
    expect(run('{{ '.repeat(1300))).toBeUndefined()
    expect(run('{{ data.x }}{{ '.repeat(300))).toBeUndefined()
    expect(run(`{{ data.x || ${'a'.repeat(3900)} }}`)).toBe('a'.repeat(3900))
    expect(run('}} {{ '.repeat(700))).toBeUndefined()
    expect(run('{{ data.x }}'.repeat(300) + '}}'.repeat(200), { x: 'v' })).toBe('v'.repeat(300) + '}}'.repeat(200))
    expect(performance.now() - start).toBeLessThan(200)
  })
})

describe('interpolateProp (validation)', () => {
  const urlNames = ['href', 'to', 'src', 'action', 'poster']
  const dangerous = [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'javascript&#58;alert(1)',
    'javascript%3Aalert(1)',
    'data:text/html,x',
  ]

  it.each(urlNames.flatMap((name) => dangerous.map((value) => [name, value])))('rejects %s=%s', (name, value) => {
    expect(run('{{ data.u }}', { u: value }, name)).toBe(REJECTED_PROP)
    expect(run('{{ data.u || d }}', { u: value }, name)).toBe(REJECTED_PROP)
  })

  it('rejects schemes built from several pieces', () => {
    expect(run('{{ data.a }}{{ data.b }}', { a: 'java', b: 'script:alert(1)' }, 'href')).toBe(REJECTED_PROP)
    expect(run('java{{ data.x }}script:alert(1)', {}, 'href')).toBe(REJECTED_PROP)
    expect(run('java{{ data.x }}script:alert(1)', { x: '' }, 'href')).toBe(REJECTED_PROP)
  })

  it('does not emit a tab split scheme as javascript', () => {
    const result = run('{{ data.a }}script:alert(1)', { a: 'java\t' }, 'href')
    expect(result).toBe('java script:alert(1)')
    expect(String(result).startsWith('javascript:')).toBe(false)
  })

  // The checks match path bindings such as `:href="data.x"`
  it.each([
    'https://a/b',
    '/p?x=1',
    '#frag',
    'mailto:a@b.c',
    'tel:+1',
    '//cdn.example/x',
    '/a:b',
    '?q=a:b',
    'data:image/png;base64,AAA',
  ])('accepts %s for href', (value) => {
    expect(run('{{ data.u }}', { u: value }, 'href')).toBe(value)
  })

  it('accepts dangerous looking text for a non-URL name', () => {
    expect(run('{{ data.t }}', { t: 'JavaScript: The Good Parts' })).toBe('JavaScript: The Good Parts')
    expect(run('{{ data.t }}', { t: 'javascript:alert(1)' }, 'title')).toBe('javascript:alert(1)')
  })

  it.each(['onclick', 'srcdoc', 'formaction', 'innerHTML', 'onlyfoo'])('rejects the unsafe name %s', (name) => {
    expect(run('a{{ data.x }}', { x: 'safe' }, name)).toBe(REJECTED_PROP)
  })

  it('does not throw on malformed percent encoding', () => {
    expect(run('/a/{{ data.x }}', { x: '100%' }, 'href')).toBe('/a/100%')
    expect(run('{{ data.x }}', { x: '%E0%A4%A' }, 'href')).toBe('%E0%A4%A')
  })
})
