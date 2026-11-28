import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index.ts'

describe('markdown-it plugin open/close tokens', () => {
  it('preserves unknown *_open/*_close plugin token pairs such as mark and ins (#525 case 34)', async () => {
    const markPlugin = (md: any) => {
      md.inline.ruler.before('emphasis', 'mark', (state: any, silent: boolean) => {
        const start = state.pos
        if (state.src.slice(start, start + 2) !== '==') return false
        const end = state.src.indexOf('==', start + 2)
        if (end === -1) return false
        if (!silent) {
          const open = state.push('mark_open', 'mark', 1)
          open.markup = '=='
          const text = state.push('text', '', 0)
          text.content = state.src.slice(start + 2, end)
          const close = state.push('mark_close', 'mark', -1)
          close.markup = '=='
        }
        state.pos = end + 2
        return true
      })
    }

    const { nodes } = await parseMarkdown('Hello ==world==!', {
      plugins: [{ name: 'test-mark', markdownItPlugins: [markPlugin] }],
    })

    expect(nodes).toEqual([['p', {}, 'Hello ', ['mark', {}, 'world'], '!']])
  })
})
