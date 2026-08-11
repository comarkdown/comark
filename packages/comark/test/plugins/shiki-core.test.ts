import { afterEach, describe, expect, it } from 'vitest'
import javascript from 'shiki/dist/langs/javascript.mjs'
import githubDark from 'shiki/dist/themes/github-dark.mjs'
import githubLight from 'shiki/dist/themes/github-light.mjs'
import { parseMarkdown } from '../../src/index'
import type { ElementNode } from '../../src/types'
import shiki, { resetHighlighter } from '../../src/plugins/shiki/core'

afterEach(resetHighlighter)

describe('shiki core entry', () => {
  it('highlights with explicitly imported themes and languages', async () => {
    const document = await parseMarkdown('```javascript\nconst answer = 42\n```', {
      plugins: [
        shiki({
          languages: [javascript],
          themes: { light: githubLight, dark: githubDark },
        }),
      ],
    })

    const pre = document.nodes[0] as ElementNode
    expect(pre[0]).toBe('pre')
    expect(pre[1]).toMatchObject({ class: expect.stringContaining('github-light') })
    expect((pre[2] as ElementNode)[0]).toBe('code')
  })

  it('does not register bundled default languages', async () => {
    const document = await parseMarkdown('```typescript\nconst answer: number = 42\n```', {
      plugins: [
        shiki({
          languages: [javascript],
          themes: { light: githubLight, dark: githubDark },
        }),
      ],
    })

    const pre = document.nodes[0] as ElementNode
    // Without a default language set, unknown langs fall back to plain text.
    const code = pre[2] as ElementNode
    expect(code[0]).toBe('code')
    expect(code[2]).toBe('const answer: number = 42')
  })
})
