import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index.ts'

describe('inline html_block tokens', () => {
  it('preserves html_block permalink tokens inside headings (#525 case 36)', async () => {
    const anchorPlugin = (md: any) => {
      md.core.ruler.push('test_anchor_html_block', (state: any) => {
        for (let i = 0; i < state.tokens.length; i++) {
          if (state.tokens[i].type === 'heading_open' && state.tokens[i + 1]?.type === 'inline') {
            const inline = state.tokens[i + 1]
            const open = new state.Token('link_open', 'a', 1)
            open.attrSet('class', 'header-anchor')
            open.attrSet('href', '#hello')
            const sym = new state.Token('html_block', '', 0)
            sym.content = '#'
            const close = new state.Token('link_close', 'a', -1)
            inline.children.push(open, sym, close)
          }
        }
      })
    }

    const { nodes } = await parseMarkdown('# Hello', {
      plugins: [{ name: 'test-anchor', markdownItPlugins: [anchorPlugin] }],
    })

    expect(nodes[0]).toEqual(['h1', { id: 'hello' }, 'Hello', ['a', { class: 'header-anchor', href: '#hello' }, '#']])
  })

  it('preserves html_block with HTML tags inside inline tokens', async () => {
    const spanPlugin = (md: any) => {
      md.core.ruler.push('test_anchor_html_span', (state: any) => {
        for (let i = 0; i < state.tokens.length; i++) {
          if (state.tokens[i].type === 'heading_open' && state.tokens[i + 1]?.type === 'inline') {
            const inline = state.tokens[i + 1]
            const open = new state.Token('link_open', 'a', 1)
            open.attrSet('class', 'header-anchor')
            open.attrSet('href', '#hello')
            const sym = new state.Token('html_block', '', 0)
            sym.content = '<span aria-hidden="true">#</span>'
            const close = new state.Token('link_close', 'a', -1)
            inline.children.push(open, sym, close)
          }
        }
      })
    }

    const { nodes } = await parseMarkdown('# Hello', {
      plugins: [{ name: 'test-anchor-span', markdownItPlugins: [spanPlugin] }],
    })

    expect(nodes[0]).toEqual([
      'h1',
      { id: 'hello' },
      'Hello',
      [
        'a',
        { class: 'header-anchor', href: '#hello' },
        ['span', { $: { html: 1, block: 0 }, 'aria-hidden': 'true' }, '#'],
      ],
    ])
  })
})
