import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index'
import { renderMarkdown } from '../src/render'
import security from '../src/plugins/security'
import { resolveAttributes } from '../src/internal/stringify/html-attributes'

describe('denial-of-service hardening', () => {
  it('sanitizes frontmatter that aliases one large object under many keys in linear time', async () => {
    const big = Array.from({ length: 3000 }, (_, i) => `  k${i}: {x: 1}`).join('\n')
    const refs = Array.from({ length: 3000 }, (_, i) => `r${i}: *a`).join('\n')
    const start = performance.now()
    const doc = await parseMarkdown(`---\nbig: &a\n${big}\n${refs}\n---\nhi`, { plugins: [security()] })
    expect(performance.now() - start).toBeLessThan(500)
    expect(Object.keys(doc.frontmatter)).toHaveLength(3001)
  })

  it('checks a large bound object once when many bindings resolve to it', () => {
    const big: Record<string, unknown> = {}
    for (let i = 0; i < 3000; i++) big[`k${i}`] = { x: 1 }
    const renderData = { frontmatter: { big }, meta: {}, data: {}, props: {} }
    const start = performance.now()
    for (let i = 0; i < 3000; i++) {
      expect(resolveAttributes({ ':a': 'frontmatter.big' }, renderData, { parseJson: true })).toEqual({ a: big })
    }
    expect(performance.now() - start).toBeLessThan(500)
  })

  it('scans a line of thousands of nested list markers inside a component in linear time', async () => {
    const start = performance.now()
    const doc = await parseMarkdown('::box\n' + '- '.repeat(20_000) + 'item\n::\n\nAfter')
    expect(performance.now() - start).toBeLessThan(500)
    expect(doc.nodes.at(-1)).toEqual(['p', {}, 'After'])
  })

  it('scans thousands of unmatched bare markers under open nested components in linear time', async () => {
    const start = performance.now()
    const nested = ':::x\n'.repeat(1_000) + '::::\n'.repeat(8_000) + ':::\n'.repeat(1_000)
    const doc = await parseMarkdown('::box\n' + nested + '::\n\nAfter')
    expect(performance.now() - start).toBeLessThan(500)
    expect(doc.nodes.at(-1)).toEqual(['p', {}, 'After'])
  })

  it('parses thousands of unclosed nested inline HTML tags without stack overflow', async () => {
    const md = '<b>'.repeat(10_000)
    const doc = await parseMarkdown(md)
    expect(doc.nodes.length).toBeGreaterThan(0)
  })

  it('parses thousands of unclosed brace groups after text in linear time', async () => {
    const doc = await parseMarkdown('Text ' + '{, '.repeat(50_000))
    expect(doc.nodes.length).toBe(1)
  })

  it('parses thousands of unclosed brace groups with keys after text in linear time', async () => {
    const doc = await parseMarkdown('Text ' + '{aaaa'.repeat(30_000))
    expect(doc.nodes.length).toBe(1)
  })

  it('does not rescan a brace group rejected because text follows it', async () => {
    const n = 40_000
    const src = 'Text ' + '{a '.repeat(n) + '} x'
    const start = performance.now()
    const doc = await parseMarkdown(src, { autoClose: false })
    expect(performance.now() - start).toBeLessThan(2_000)
    expect(doc.nodes).toEqual([['p', {}, src]])
  })

  it('parses an escaped backtick inside a brace group kept as text', async () => {
    const doc = await parseMarkdown('Text {a, \\`` {b}}', { autoClose: false })
    expect(doc.nodes).toEqual([['p', {}, 'Text {a, `` {b}}']])
  })

  it('clamps unbounded codeblock highlight ranges', async () => {
    const doc = await parseMarkdown('```js {1-999999999}\nconst x = 1\n```')
    const pre = doc.nodes[0] as [string, Record<string, unknown>, ...unknown[]]
    // Oversized ranges are dropped rather than expanded
    expect((pre[1].highlights as number[] | undefined)?.length ?? 0).toBeLessThanOrEqual(1_000)
  })

  it('keeps highlight lines beyond the block length (documented behavior)', async () => {
    const doc = await parseMarkdown('```js {1-3,50}\nconst x = 1\nconst y = 2\n```')
    const pre = doc.nodes[0] as [string, Record<string, unknown>, ...unknown[]]
    expect(pre[1].highlights).toEqual([1, 2, 3, 50])
  })

  it('serializes a non-string class attribute without throwing', async () => {
    const doc = await parseMarkdown('Hi [x]{class=["a","b"]}')
    await expect(renderMarkdown(doc)).resolves.toContain('.a.b')
  })

  it('parses large plain documents without the task-list quadratic scan', async () => {
    // Scanning preceding tokens backwards per inline token would make list-free documents O(n^2).
    const md = Array.from({ length: 2_000 }, (_, i) => `Paragraph ${i} with some text.`).join('\n\n')
    const doc = await parseMarkdown(md)
    expect(doc.nodes.length).toBe(2_000)
  })

  it('still marks task lists after the linear rewrite', async () => {
    const doc = await parseMarkdown('- [ ] todo\n- [x] done\n\n- outer\n  - [x] nested\n')
    const html = JSON.stringify(doc.nodes)
    expect(html).toContain('task-list-item')
    expect(html).toContain('contains-task-list')
  })

  it('escapes long runs of tag-like text without quadratic rescanning', async () => {
    // Rescanning the remainder of the node for `>` on every `<` would be O(n^2) on `<a<a<a...`.
    const text = '<a'.repeat(50_000)
    const doc = { frontmatter: {}, meta: {}, nodes: [['p', {}, text]] } as any
    const md = await renderMarkdown(doc)
    // No `>` anywhere, so nothing is tag-like and the text stays untouched
    expect(md.trim()).toBe(text)
  })
})
