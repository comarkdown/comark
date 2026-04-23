import { describe, expect, it } from 'vitest'
import { parse } from '../../src/parse'
import { renderMarkdown } from '../../src/render'
import binding, { Binding } from '../../src/plugins/binding'
import { renderHTMLForTest } from '../utils/render-html'

const parseWithBinding = (md: string, opts: Parameters<typeof binding>[0] = {}) =>
  parse(md, { plugins: [binding(opts)] })

describe('binding plugin — parsing', () => {
  it('captures `{{ path }}` as a self-closing <binding> element with :value', async () => {
    const tree = await parseWithBinding('Hello {{ user.name }}!')
    expect(tree.nodes).toEqual([['p', {}, 'Hello ', ['binding', { ':value': 'user.name' }], '!']])
  })

  it('captures the `|| default` fallback as a defaultValue attribute', async () => {
    const tree = await parseWithBinding('Score: {{ data.score || 0 }}')
    expect(tree.nodes).toEqual([['p', {}, 'Score: ', ['binding', { ':value': 'data.score', defaultValue: '0' }]]])
  })

  it('trims whitespace inside the braces and around the `||` separator', async () => {
    const tree = await parseWithBinding('{{   user.name   ||   guest   }}')
    expect(tree.nodes).toEqual([['p', {}, ['binding', { ':value': 'user.name', defaultValue: 'guest' }]]])
  })

  it('supports multiple bindings in the same paragraph', async () => {
    const tree = await parseWithBinding('Hi {{ a }}, welcome to {{ b }}.')
    expect(tree.nodes).toEqual([
      ['p', {}, 'Hi ', ['binding', { ':value': 'a' }], ', welcome to ', ['binding', { ':value': 'b' }], '.'],
    ])
  })

  it('ignores empty `{{ }}` and leaves the raw source in the text', async () => {
    const tree = await parseWithBinding('x {{  }} y')
    expect(tree.nodes).toEqual([['p', {}, 'x {{  }} y']])
  })

  it('ignores an unclosed `{{` and leaves the raw source in the text', async () => {
    const tree = await parseWithBinding('x {{ unclosed')
    expect(tree.nodes).toEqual([['p', {}, 'x {{ unclosed']])
  })

  it('does not trigger on a single `{` brace', async () => {
    const tree = await parseWithBinding('single { value } here')
    // No binding element should appear in the output.
    const json = JSON.stringify(tree.nodes)
    expect(json).not.toContain('"binding"')
  })
})

describe('binding plugin — options', () => {
  it('uses a custom tag when the `tag` option is set', async () => {
    const tree = await parseWithBinding('x {{ y }} z', { tag: 'prop' })
    expect(tree.nodes).toEqual([['p', {}, 'x ', ['prop', { ':value': 'y' }], ' z']])
  })

  it('defaults the tag name to `binding`', async () => {
    const tree = await parseWithBinding('{{ x }}')
    expect(tree.nodes[0]).toEqual(['p', {}, ['binding', { ':value': 'x' }]])
  })
})

describe('binding plugin — rendering', () => {
  it('resolves the binding against frontmatter when rendering to HTML', async () => {
    const tree = await parseWithBinding(`---
user:
  name: Ada
---

Hello {{ frontmatter.user.name }}!
`)
    const html = await renderHTMLForTest(tree)
    // The data-binding layer strips the `:` and resolves the dot path.
    expect(html).toContain('<binding value="Ada">')
  })

  it('leaves the raw path intact in HTML when the binding does not resolve', async () => {
    const tree = await parseWithBinding('Score: {{ data.missing }}')
    const html = await renderHTMLForTest(tree)
    expect(html).toContain('binding value="data.missing"')
  })

  it('round-trips the source through renderMarkdown as `:tag{:value="..."}`', async () => {
    const tree = await parseWithBinding('Hello {{ user.name }}!')
    const md = await renderMarkdown(tree)
    expect(md.trim()).toBe('Hello :binding{:value="user.name"}!')
  })

  it('round-trips the default value through renderMarkdown', async () => {
    const tree = await parseWithBinding('score {{ a || b }} ok')
    const md = await renderMarkdown(tree)
    expect(md.trim()).toBe('score :binding{:value="a" defaultValue="b"} ok')
  })
})

describe('binding plugin — exported Binding markdown handler', () => {
  it('renders a `{{ path }}` binding back to its source shorthand', async () => {
    const tree = await parseWithBinding('Hello {{ user.name }}!')
    const md = await renderMarkdown(tree, { components: { binding: Binding } })
    expect(md.trim()).toBe('Hello {{ user.name }}!')
  })

  it('renders a `{{ path || default }}` binding back to its source shorthand', async () => {
    const tree = await parseWithBinding('score {{ a || b }} ok')
    const md = await renderMarkdown(tree, { components: { binding: Binding } })
    expect(md.trim()).toBe('score {{ a || b }} ok')
  })

  it('returns an empty string when the binding has no path (defensive)', () => {
    expect(Binding(['binding', {}] as any, {} as any)).toBe('')
  })

  it('resolves `{{ props.* }}` across auto-generated paragraph wrappers', async () => {
    const { Binding: HTMLBinding } = await import('../../../comark-html/src/plugins/binding')
    const tree = await parseWithBinding(`::card{title="Hello"}
Intro text.

{{ props.title }}
::`)
    const html = await renderHTMLForTest(tree, { components: { binding: HTMLBinding } })
    // The binding lives inside a second `<p>` wrapper, but the card's `title`
    // prop must still reach across it.
    expect(html).toContain('Hello')
    // The wrapper paragraph must not inherit the card's `title` attribute.
    expect(html).not.toContain('<p title=')
  })
})
