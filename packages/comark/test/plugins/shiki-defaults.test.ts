import { afterEach, describe, expect, it } from 'vitest'
import javascript from 'shiki/dist/langs/javascript.mjs'
import githubDark from 'shiki/dist/themes/github-dark.mjs'
import githubLight from 'shiki/dist/themes/github-light.mjs'
import { parseMarkdown } from '../../src/index'
import type { ElementNode } from '../../src/types'
import shiki, { resetHighlighter } from '../../src/plugins/shiki'

afterEach(resetHighlighter)

describe('shiki standard entry defaults', () => {
  it('registers default languages when shiki() is called with no options', async () => {
    const document = await parseMarkdown('```typescript\nconst answer: number = 42\n```', {
      plugins: [shiki()],
    })

    const pre = document.nodes[0] as ElementNode
    const code = pre[2] as ElementNode
    // Tokenized: first child of code is a line span, not plain text
    expect(code[0]).toBe('code')
    expect(Array.isArray(code[2])).toBe(true)
  })

  it('skips default languages when registerDefaultLanguages is false', async () => {
    const document = await parseMarkdown('```typescript\nconst answer: number = 42\n```', {
      plugins: [
        shiki({
          registerDefaultLanguages: false,
          languages: [javascript],
          themes: { light: githubLight, dark: githubDark },
        }),
      ],
    })

    const pre = document.nodes[0] as ElementNode
    const code = pre[2] as ElementNode
    expect(code[0]).toBe('code')
    expect(code[2]).toBe('const answer: number = 42')
  })
})
