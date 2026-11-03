import { describe, expect, it } from 'vitest'
import { createMarkdownParser } from '../src/parse'

// The root `markdown-exit` entry registers a plain LinkifyIt factory for every
// instance, so it runs in its own file to keep that global out of other tests.
describe('linkify with the markdown-exit root entry loaded', () => {
  it('still links bare domains and URLs with credentials', async () => {
    await import('markdown-exit')

    const doc = await createMarkdownParser()('www.example.com and https://user:pw@example.com/a')

    expect(doc.nodes).toEqual([
      [
        'p',
        {},
        ['a', { href: 'http://www.example.com' }, 'www.example.com'],
        ' and ',
        ['a', { href: 'https://user:pw@example.com/a' }, 'https://user:pw@example.com/a'],
      ],
    ])
  })
})
