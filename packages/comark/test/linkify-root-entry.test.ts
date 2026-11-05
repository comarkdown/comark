import { describe, expect, it } from 'vitest'
import { createMarkdownParser } from '../src/index'
import linkify from '../src/plugins/linkify'

// The root `markdown-exit` entry registers a plain LinkifyIt factory for every
// instance, so it runs in its own file to keep that global out of other tests.
describe('linkify with the markdown-exit root entry loaded', () => {
  it('still uses the plugin options and links nothing without the plugin', async () => {
    await import('markdown-exit')
    const source = 'www.example.com and https://comark.dev'

    const fuzzy = await createMarkdownParser({ plugins: [linkify({ fuzzyLink: true })] })(source)
    const plain = await createMarkdownParser({ registerDefaultPlugins: false })(source)

    expect(fuzzy.nodes).toEqual([
      [
        'p',
        {},
        ['a', { href: 'http://www.example.com' }, 'www.example.com'],
        ' and ',
        ['a', { href: 'https://comark.dev' }, 'https://comark.dev'],
      ],
    ])
    expect(plain.nodes).toEqual([['p', {}, source]])
  })
})
