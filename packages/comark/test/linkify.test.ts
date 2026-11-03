import { execFileSync } from 'node:child_process'
import { describe, expect, it, vi } from 'vitest'
import type { MarkdownItPlugin } from 'comark'
import { createMarkdownParser, defineComarkPlugin, parseMarkdown } from '../src/parse'

const linkifiers = vi.hoisted(() => ({ created: 0 }))
vi.mock('linkify-it', async (importOriginal) => {
  const actual = await importOriginal<typeof import('linkify-it')>()
  class LinkifyIt extends actual.LinkifyIt {
    constructor(...args: ConstructorParameters<typeof actual.LinkifyIt>) {
      super(...args)
      linkifiers.created++
    }
  }
  return { ...actual, LinkifyIt }
})

describe('linkify', () => {
  it('links bare domains and URLs with credentials', async () => {
    const doc = await parseMarkdown('www.example.com and https://user:pw@example.com/a')
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

  it('creates one linkifier when a new parser runs several parses at once', async () => {
    // A markdown-it plugin no other parser uses keeps this parser out of the shared cache.
    const fresh = defineComarkPlugin(() => ({
      name: 'linkify-concurrent',
      markdownItPlugins: [(() => {}) as unknown as MarkdownItPlugin],
    }))
    const parse = createMarkdownParser({ plugins: [fresh()] })
    const before = linkifiers.created

    const docs = await Promise.all(Array.from({ length: 10 }, () => parse('See https://comark.dev')))

    expect(linkifiers.created - before).toBe(1)
    expect(docs[9].nodes).toEqual([['p', {}, 'See ', ['a', { href: 'https://comark.dev' }, 'https://comark.dev']]])
  })

  it('loads linkify-it only for parsers with linkify enabled', () => {
    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
        import { registerHooks } from 'node:module'
        const loaded = []
        registerHooks({
          load(url, context, next) {
            if (url.includes('/linkify-it/')) loaded.push(url)
            return next(url, context)
          },
        })
        const { createMarkdownParser } = await import('comark')
        await createMarkdownParser({ linkify: false })('https://comark.dev')
        const before = loaded.length
        await createMarkdownParser()('https://comark.dev')
        console.log(before, loaded.length > 0)
      `,
      ],
      { cwd: import.meta.dirname, encoding: 'utf8' }
    )
    expect(output.trim()).toBe('0 true')
  })
})
