import { describe, expect, it, vi } from 'vitest'
import type { MarkdownItPlugin } from 'comark'
import type { MarkdownExit } from 'markdown-exit/core'
import { createMarkdownParser, defineComarkPlugin } from '../src/parse'

const load = vi.hoisted(() => ({ fail: true }))
vi.mock('linkify-it', async (importOriginal) => {
  if (load.fail) {
    load.fail = false
    throw new Error('Failed to fetch dynamically imported module')
  }
  return importOriginal()
})

describe('linkify setup failure', () => {
  it('retries the import on the next parse', async () => {
    const parse = createMarkdownParser()

    await expect(parse('https://comark.dev')).rejects.toThrow()
    const doc = await parse('https://comark.dev')

    expect(doc.nodes).toEqual([['p', {}, ['a', { href: 'https://comark.dev' }, 'https://comark.dev']]])
  })

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
    const parse = createMarkdownParser({ plugins: [flaky()] })

    await expect(parse('text')).rejects.toThrow('plugin failed')
    await parse('text')

    // The rule from the failed install is gone, so it runs once.
    expect(runs).toBe(1)
  })
})
