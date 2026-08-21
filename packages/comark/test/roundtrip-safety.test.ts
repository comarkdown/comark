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

