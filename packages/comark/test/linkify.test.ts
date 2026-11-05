import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MarkdownItPlugin } from 'comark'
import type { MarkdownExit } from 'markdown-exit/core'
import { createMarkdownParser, defineComarkPlugin, parseMarkdown } from '../src/index'
import { createMarkdownParser as createCoreMarkdownParser } from '../src/core'
import linkify from '../src/plugins/linkify'

const link = ['a', { href: 'https://comark.dev' }, 'https://comark.dev']

describe('linkify', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('links scheme URLs and emails, not bare domains, by default', async () => {
    const doc = await parseMarkdown('https://comark.dev, hi@comark.dev and www.example.com')
    expect(doc.nodes).toEqual([
      ['p', {}, link, ', ', ['a', { href: 'mailto:hi@comark.dev' }, 'hi@comark.dev'], ' and www.example.com'],
    ])
  })

  it('passes options to linkify-it, so fuzzy links and URL credentials are opt-in', async () => {
    const source = 'www.example.com and https://user:pw@example.com/a'
    const parse = createMarkdownParser({
      registerDefaultPlugins: false,
      plugins: [linkify({ fuzzyLink: true, urlAuth: true })],
    })

    const doc = await parse(source)

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

  it('replaces the default plugin with a configured one', async () => {
    const doc = await createMarkdownParser({ plugins: [linkify({ fuzzyLink: true })] })('www.example.com')

    expect(doc.nodes).toEqual([['p', {}, ['a', { href: 'http://www.example.com' }, 'www.example.com']]])
  })

  it('gives markdown-it plugins md.linkify when they are installed', async () => {
    // Mention plugins register a linkify schema when installed.
    const mention = defineComarkPlugin(() => ({
      name: 'linkify-mention',
      markdownItPlugins: [
        ((md: MarkdownExit) => {
          md.linkify.add('@', {
            validate: (text: string, pos: number) => /^[\w-]+/.exec(text.slice(pos))?.[0].length ?? 0,
            normalize: (match) => {
              match.url = `https://github.com/${match.url.slice(1)}`
            },
          })
        }) as unknown as MarkdownItPlugin,
      ],
    }))

    const doc = await createMarkdownParser({ plugins: [mention()] })('hi @comark')

    expect(doc.nodes).toEqual([['p', {}, 'hi ', ['a', { href: 'https://github.com/comark' }, '@comark']]])
  })

  it('is a default plugin', async () => {
    const plain = await createMarkdownParser({ registerDefaultPlugins: false })('https://comark.dev')
    const linked = await createMarkdownParser({ registerDefaultPlugins: false, plugins: [linkify()] })(
      'https://comark.dev'
    )

    expect(plain.nodes).toEqual([['p', {}, 'https://comark.dev']])
    expect(linked.nodes).toEqual([['p', {}, link]])
  })

  it('keeps parsers with and without linkify independent', async () => {
    const source = 'See https://comark.dev'
    const linkedNodes = [['p', {}, 'See ', link]]
    const plainNodes = [['p', {}, source]]

    const withLinkify = createMarkdownParser({ registerDefaultPlugins: false, plugins: [linkify()] })
    const withoutLinkify = createMarkdownParser({ registerDefaultPlugins: false })

    // Interleave, so state leaking between the two parsers in either direction would show up.
    const [linked, plain] = await Promise.all([withLinkify(source), withoutLinkify(source)])
    const plainAgain = await withoutLinkify(source)
    const linkedAgain = await withLinkify(source)

    expect(linked.nodes).toEqual(linkedNodes)
    expect(linkedAgain.nodes).toEqual(linkedNodes)
    expect(plain.nodes).toEqual(plainNodes)
    expect(plainAgain.nodes).toEqual(plainNodes)
  })

  it('links with comark/core only when the plugin is registered', async () => {
    const plain = await createCoreMarkdownParser()('https://comark.dev')
    const linked = await createCoreMarkdownParser({ plugins: [linkify()] })('https://comark.dev')

    expect(plain.nodes).toEqual([['p', {}, 'https://comark.dev']])
    expect(linked.nodes).toEqual([['p', {}, link]])
  })

  describe('deprecated linkify option', () => {
    it('still controls the default plugin, over registerDefaultPlugins', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})

      const off = await createMarkdownParser({ linkify: false })('https://comark.dev')
      const on = await createMarkdownParser({ registerDefaultPlugins: false, linkify: true })('https://comark.dev')
      const explicit = await createMarkdownParser({ linkify: false, plugins: [linkify()] })('https://comark.dev')

      expect(off.nodes).toEqual([['p', {}, 'https://comark.dev']])
      expect(on.nodes).toEqual([['p', {}, link]])
      expect(explicit.nodes).toEqual([['p', {}, link]])
    })

    it('warns at most once per process', async () => {
      // A fresh module copy, so a warning from another test does not count.
      vi.resetModules()
      const { createMarkdownParser: create } = await import('../src/index')
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      create()
      expect(warn).not.toHaveBeenCalled()

      create({ linkify: false })
      create({ linkify: true })
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0]![0]).toContain('`ParserOptions.linkify` is deprecated')
    })
  })
})
