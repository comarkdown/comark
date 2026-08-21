import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse'
import { renderMarkdown } from '../src/render'
import mermaid from '../src/plugins/mermaid'
import type { MarkdownDocument } from '../src/types'

async function roundTrip(md: string, options?: Parameters<typeof parseMarkdown>[1]) {
  const t1 = await parseMarkdown(md, options)
  const rendered = await renderMarkdown(t1)
  const t2 = await parseMarkdown(rendered, options)
  return { t1, t2, rendered }
}

describe('code fence selection', () => {
  it('picks a fence that content with both ``` and ~~~ cannot close', async () => {
    const code = 'let a = 1\n```\n~~~\n::alert\nowned\n::'
    const doc = {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'js' }, ['code', { class: 'language-js' }, code]]],
    } as unknown as MarkdownDocument
    const rendered = await renderMarkdown(doc)
    const t2 = await parseMarkdown(rendered)
    expect(t2.nodes).toEqual(doc.nodes)
  })

  it('widens the fence past the longest backtick run in the content', async () => {
    const code = 'const s = ""\n````\nend'
    const doc = {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'js' }, ['code', { class: 'language-js' }, code]]],
    } as unknown as MarkdownDocument
    const rendered = await renderMarkdown(doc)
    const t2 = await parseMarkdown(rendered)
    expect(t2.nodes).toEqual(doc.nodes)
  })
})

describe('mermaid fence selection', () => {
  it('does not let mermaid content escape its fence', async () => {
    // A mermaid body containing ``` must not terminate the serialized fence
    const md = '````mermaid\ngraph TD\n```\nA --> B\n````'
    const { t1, t2 } = await roundTrip(md, { plugins: [mermaid()] })
    expect(t2.nodes).toEqual(t1.nodes)
  })
})

describe('component marker escaping', () => {
  it('keeps escaped :: markers as literal text through a round trip', async () => {
    const { t2 } = await roundTrip('\\:\\:alert')
    expect(t2.nodes).toEqual([['p', {}, '::alert']])
  })

  it('keeps entity-encoded :: markers as literal text through a round trip', async () => {
    const { t2 } = await roundTrip('&#58;&#58;alert')
    expect(t2.nodes).toEqual([['p', {}, '::alert']])
  })

  it('escapes a bare :: line inside block component content', async () => {
    // The middle paragraph is the literal text `::` (escaped in the source),
    // which must not become a fence close after serialization.
    const md = '::card\nfirst\n\n\\::\n\nsecond\n::'
    const { t1, t2 } = await roundTrip(md)
    expect(t2.nodes).toEqual(t1.nodes)
  })

  it('escapes inline component markers in text', async () => {
    const { t2 } = await roundTrip('type \\:alert to continue')
    expect(t2.nodes).toEqual([['p', {}, 'type :alert to continue']])
  })

  it('escapes attribute block openers after inline elements', async () => {
    const { t2 } = await roundTrip('**bold** \\{.red}')
    expect(t2.nodes).toEqual([['p', {}, ['strong', {}, 'bold'], ' {.red}']])
  })
})

describe('comarkAttributes quoting', () => {
  it('round-trips attribute values containing double quotes', async () => {
    // The text sibling keeps the span inline in both parses (a lone
    // `:span[...]` line is a leaf block component — pre-existing asymmetry).
    const md = `say :span[hi]{title='a"b'} now`
    const { t1, t2 } = await roundTrip(md)
    expect(t2.nodes).toEqual(t1.nodes)
  })

  it('does not let a quoted value inject a new attribute on re-parse', async () => {
    const md = `:span[hi]{title='x" bad="1'}`
    const { t2 } = await roundTrip(md)
    const span = (t2.nodes[0] as any[])[2] // p > span
    expect(span[1].title).toBe('x" bad="1')
    expect(span[1].bad).toBeUndefined()
  })
})
