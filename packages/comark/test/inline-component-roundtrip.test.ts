import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'
import { renderMarkdown } from '../src/render'
import type { ComarkTree } from '../src'

/**
 * An inline-positioned component must render its element children in inline
 * form too: a block `:::fence` inside `:name[…]` cannot be parsed back.
 * Children here are kept bracket-free so these cases do not depend on the
 * parser's nested-bracket handling.
 */
const tree = (...children: unknown[]): ComarkTree =>
  ({ frontmatter: {}, meta: {}, nodes: [['p', {}, ...children]] }) as ComarkTree

describe('inline component round-trip (renderMarkdown → parse)', () => {
  it('renders element children of an inline component in inline form', async () => {
    const t = tree('a ', ['alert', {}, ['item', { x: '1' }]], ' b')
    const rendered = await renderMarkdown(t)

    expect(rendered).toBe('a :alert[:item{x="1"}] b')
    expect((await parse(rendered)).nodes).toEqual(t.nodes)
  })

  it('keeps text-only children inline', async () => {
    const t = tree('a ', ['alert', {}, 'hello'], ' b')
    const rendered = await renderMarkdown(t)

    expect(rendered).toBe('a :alert[hello] b')
    expect((await parse(rendered)).nodes).toEqual(t.nodes)
  })

  it('renders element children of a span in inline form', async () => {
    const t = tree('a ', ['span', {}, ['item', { x: '1' }]], ' b')
    const rendered = await renderMarkdown(t)

    expect(rendered).toBe('a [:item{x="1"}] b')
    expect((await parse(rendered)).nodes).toEqual(t.nodes)
  })
})
