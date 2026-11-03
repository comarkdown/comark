import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse'

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
