import { describe, expect, it } from 'vitest'
import type { MarkdownItPlugin } from 'comark'
import type { MarkdownExit } from 'markdown-exit/core'
import { createMarkdownParser, defineComarkPlugin } from '../src/index'

describe('markdown-it plugin setup failure', () => {
  it('installs plugins on a fresh instance after a plugin throws', async () => {
    let installs = 0
    let runs = 0
    const flaky = defineComarkPlugin(() => ({
      name: 'flaky',
      markdownItPlugins: [
        ((md: MarkdownExit) => {
          md.core.ruler.push('count-runs', () => {
            runs++
          })
          if (installs++ === 0) throw new Error('plugin failed')
        }) as unknown as MarkdownItPlugin,
      ],
    }))
    const plugin = flaky()

    expect(() => createMarkdownParser({ plugins: [plugin] })).toThrow('plugin failed')
    await createMarkdownParser({ plugins: [plugin] })('text')

    // The rule from the failed install is gone, so it runs once.
    expect(runs).toBe(1)
  })
})
