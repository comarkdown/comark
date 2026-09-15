import { describe, expect, it } from 'vitest'
import type { Node } from 'comark'
import type { NodeRenderData } from '../src/types.ts'
import { resolveAttribute, resolveAttributes } from '../src/internal/stringify/attributes.ts'
import { parseMarkdown } from '../src/index'

const makeRenderData = (overrides: Partial<NodeRenderData> = {}): NodeRenderData => ({
  frontmatter: {},
  meta: {},
  data: {},
  props: {},
  ...overrides,
})

describe('resolveAttributes (default / preserve mode)', () => {
  it('resolves a :prefix binding from frontmatter and strips the colon', () => {
    const result = resolveAttributes(
      { ':title': 'frontmatter.site.name', type: 'info' },
      makeRenderData({ frontmatter: { site: { name: 'My Blog' } } })
    )
    expect(result).toEqual({ title: 'My Blog', type: 'info' })
  })

  it('resolves across all namespaces', () => {
    const result = resolveAttributes(
      {
        ':fromFm': 'frontmatter.a',
        ':fromMeta': 'meta.b',
        ':fromData': 'data.c',
        ':fromProps': 'props.d',
      },
      makeRenderData({
        frontmatter: { a: 'A' },
        meta: { b: 'B' },
        data: { c: 'C' },
        props: { d: 'D' },
      })
    )
    expect(result).toEqual({ fromFm: 'A', fromMeta: 'B', fromData: 'C', fromProps: 'D' })
  })

  it('preserves unresolved paths verbatim (with the :prefix intact)', () => {
    const result = resolveAttributes({ ':to': '$doc.snippet.link' }, makeRenderData())
    expect(result).toEqual({ ':to': '$doc.snippet.link' })
  })

  it('preserves string literals verbatim (does not JSON-parse)', () => {
    const result = resolveAttributes({ ':count': '5', ':active': 'true' }, makeRenderData())
    expect(result).toEqual({ ':count': '5', ':active': 'true' })
  })

  it('passes non-string :prefix values through with the prefix preserved', () => {
    const result = resolveAttributes({ ':config': { k: 'v' } }, makeRenderData())
    expect(result).toEqual({ ':config': { k: 'v' } })
  })

  it('passes non-:prefix attributes through unchanged', () => {
    const result = resolveAttributes({ id: 'main', 'data-x': '1' }, makeRenderData({ frontmatter: { main: 'nope' } }))
    expect(result).toEqual({ id: 'main', 'data-x': '1' })
  })

  it('drops the internal $ metadata key', () => {
    const result = resolveAttributes({ $: { line: 3 }, type: 'info' }, makeRenderData())
    expect(result).toEqual({ type: 'info' })
  })
})

describe('resolveAttributes (parseJson mode)', () => {
  const renderData = makeRenderData({ frontmatter: { title: 'Hello' } })

  it('JSON-parses numeric, boolean, and null literals', () => {
    const result = resolveAttributes({ ':count': '5', ':active': 'true', ':missing': 'null' }, renderData, {
      parseJson: true,
    })
    expect(result).toEqual({ count: 5, active: true, missing: null })
  })

  it('JSON-parses object values and strips the :prefix', () => {
    const result = resolveAttributes({ ':config': '{"k":"v"}' }, renderData, { parseJson: true })
    expect(result).toEqual({ config: { k: 'v' } })
  })

  it('resolves dot-paths as a fallback when JSON.parse fails', () => {
    const result = resolveAttributes({ ':title': 'frontmatter.title' }, renderData, { parseJson: true })
    expect(result).toEqual({ title: 'Hello' })
  })

  it('yields undefined for unresolved dot-paths (prop is present, value undefined)', () => {
    const result = resolveAttributes({ ':title': 'frontmatter.missing' }, renderData, { parseJson: true })
    expect(result).toHaveProperty('title', undefined)
  })

  it('still drops $ and passes non-:prefix attributes through', () => {
    const result = resolveAttributes({ $: { line: 1 }, id: 'main', ':count': '5' }, renderData, { parseJson: true })
    expect(result).toEqual({ id: 'main', count: 5 })
  })

  it('strips :prefix for non-string values already decoded by the parser', () => {
    const result = resolveAttributes({ ':config': { k: 'v' } }, renderData, { parseJson: true })
    expect(result).toEqual({ config: { k: 'v' } })
  })
})

describe('HTML sink props', () => {
  it('drops innerHTML / dangerouslySetInnerHTML / textContent from resolved attributes', () => {
    const result = resolveAttributes(
      {
        innerHTML: '<img src=x onerror=alert(1)>',
        textContent: 'overlay',
        dangerouslySetInnerHTML: { __html: '<img src=x onerror=alert(1)>' },
        title: 'safe',
      },
      makeRenderData()
    )
    expect(result).toEqual({ title: 'safe' })
  })

  it('drops sink props with any casing and with the :binding prefix', () => {
    const result = resolveAttributes(
      {
        InnerHtml: '<img src=x>',
        ':dangerouslySetInnerHTML': '{"__html":"<img src=x>"}',
        TEXTCONTENT: 'overlay',
        id: 'keep',
      },
      makeRenderData(),
      { parseJson: true }
    )
    expect(result).toEqual({ id: 'keep' })
  })
})

describe('unsafe URL bindings (render-time hard floor)', () => {
  it('drops :href bindings resolving to javascript: via dot-path', () => {
    const result = resolveAttributes(
      { ':href': 'frontmatter.home' },
      makeRenderData({ frontmatter: { home: 'javascript:alert(1)' } })
    )
    expect(result).toEqual({})
  })

  it('drops :href bindings resolving to javascript: via JSON (parseJson mode)', () => {
    const result = resolveAttributes({ ':href': '"javascript:alert(1)"' }, makeRenderData(), { parseJson: true })
    expect(result).toEqual({})
  })

  it('drops :src bindings resolving to data:text/html', () => {
    const result = resolveAttributes({ ':src': '"data:text/html,<script>alert(1)</script>"' }, makeRenderData(), {
      parseJson: true,
    })
    expect(result).toEqual({})
  })

  it('drops bindings whose resolved value is entity-encoded javascript:', () => {
    const result = resolveAttributes(
      { ':href': 'frontmatter.home' },
      makeRenderData({ frontmatter: { home: 'javascript&#58;alert(1)' } })
    )
    expect(result).toEqual({})
  })

  it('keeps safe URL bindings', () => {
    const result = resolveAttributes(
      { ':href': 'frontmatter.home' },
      makeRenderData({ frontmatter: { home: 'https://example.com' } })
    )
    expect(result).toEqual({ href: 'https://example.com' })
  })

  it('keeps relative URL bindings', () => {
    const result = resolveAttributes(
      { ':href': 'frontmatter.home' },
      makeRenderData({ frontmatter: { home: '/about' } })
    )
    expect(result).toEqual({ href: '/about' })
  })

  it('does not drop literal javascript: hrefs — parse-time validation is the plugin\u2019s job', () => {
    const result = resolveAttributes({ href: 'javascript:alert(1)' }, makeRenderData())
    expect(result).toEqual({ href: 'javascript:alert(1)' })
  })

  it('does not drop non-URL bindings with unsafe-looking strings', () => {
    const result = resolveAttributes(
      { ':title': 'frontmatter.t' },
      makeRenderData({ frontmatter: { t: 'javascript: is a scheme' } })
    )
    expect(result).toEqual({ title: 'javascript: is a scheme' })
  })
})

describe('parseMarkdown + resolveAttributes end-to-end (#364)', () => {
  const renderData = makeRenderData()

  it('restores native number/boolean/null/object types from a YAML block-props component', async () => {
    const doc = await parseMarkdown(`::comp
---
label: "hello"
count: 3
a-negative-number: -1.5
enabled: false
active: true
nested:
  x: 1
  y: true
nothing: null
---
::`)
    const comp = doc.nodes[0] as Node
    const attrs = (comp as unknown as [string, Record<string, unknown>])[1]

    const resolved = resolveAttributes(attrs, renderData, { parseJson: true })

    expect(resolved).toEqual({
      label: 'hello',
      count: 3,
      'a-negative-number': -1.5,
      enabled: false,
      active: true,
      nested: { x: 1, y: true },
      nothing: null,
    })
  })

  it('keeps an explicitly-quoted YAML string a string end-to-end, not a coerced number/boolean', async () => {
    const doc = await parseMarkdown('::comp\n---\ncount: "3"\nenabled: "false"\n---\n::')
    const comp = doc.nodes[0] as Node
    const attrs = (comp as unknown as [string, Record<string, unknown>])[1]

    const resolved = resolveAttributes(attrs, renderData, { parseJson: true })

    expect(resolved).toEqual({ count: '3', enabled: 'false' })
  })
})

describe('resolveAttribute (single-attr lookup)', () => {
  const renderData = makeRenderData({ frontmatter: { home: 'https://example.com' } })

  it('prefers the :prefix binding when a dot-path resolves', () => {
    const value = resolveAttribute({ href: 'fallback', ':href': 'frontmatter.home' }, renderData, 'href')
    expect(value).toBe('https://example.com')
  })

  it('falls back to the raw :prefix value when the path is unresolved', () => {
    const value = resolveAttribute({ ':href': 'unknown.path' }, renderData, 'href')
    expect(value).toBe('unknown.path')
  })

  it('returns the non-:prefix value when no binding is present', () => {
    const value = resolveAttribute({ href: '/about' }, renderData, 'href')
    expect(value).toBe('/about')
  })

  it('returns undefined when the attribute is missing entirely', () => {
    const value = resolveAttribute({}, renderData, 'href')
    expect(value).toBeUndefined()
  })

  it('passes non-string :prefix values through untouched', () => {
    const config = { k: 'v' }
    const value = resolveAttribute({ ':config': config }, renderData, 'config')
    expect(value).toBe(config)
  })
})
