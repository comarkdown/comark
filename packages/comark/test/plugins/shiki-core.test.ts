import { afterEach, describe, expect, it } from 'vitest'
import javascript from 'shiki/dist/langs/javascript.mjs'
import githubDark from 'shiki/dist/themes/github-dark.mjs'
import githubLight from 'shiki/dist/themes/github-light.mjs'
import { parseMarkdown } from '../../src/index'
import type { ElementNode } from '../../src/types'
import shiki, { resetHighlighter } from '../../src/plugins/shiki/core'

afterEach(resetHighlighter)

describe('shiki core entry', () => {
  it('highlights with explicitly imported themes', async () => {
    const document = await parseMarkdown('```javascript\nconst answer = 42\n```', {
      plugins: [
        shiki({
          registerDefaultLanguages: false,
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
})
