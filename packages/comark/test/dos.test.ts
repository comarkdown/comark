import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse'
import { renderMarkdown } from '../src/render'

describe('denial-of-service hardening', () => {
  it('parses thousands of unclosed nested inline HTML tags without stack overflow', async () => {
    const md = '<b>'.repeat(10_000)
    const doc = await parseMarkdown(md)
    expect(doc.nodes.length).toBeGreaterThan(0)
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
    // The default task-list rule used to scan all preceding tokens backwards
    // for every inline token — O(n²) on documents that contain no list.
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
})
