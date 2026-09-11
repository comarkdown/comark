import { describe, expect, it } from 'vitest'
import { createMarkdownParser, defineComarkPlugin } from 'comark'
import type { MarkdownItPlugin } from 'comark'

// `getMarkdownExit()` is internal, so the memo is observed through the public
// API: a markdown-it plugin function only runs once per shared instance, so
// counting its registrations counts the instances that were built.
let stableUses = 0
const stableMdPlugin = (() => {
  stableUses++
}) as unknown as MarkdownItPlugin

const stablePlugin = defineComarkPlugin(() => ({
  name: 'memo-stable',
  markdownItPlugins: [stableMdPlugin],
}))

let closureUses = 0
const closurePlugin = defineComarkPlugin(() => ({
  name: 'memo-closure',
  markdownItPlugins: [
    (() => {
      closureUses++
    }) as unknown as MarkdownItPlugin,
  ],
}))

describe('markdown-exit instance sharing', () => {
  it('still returns a fresh parser function on every call', () => {
    expect(createMarkdownParser()).not.toBe(createMarkdownParser())
  })

  it('builds one markdown-it instance for parsers with the same plugin functions', () => {
    const plugin = stablePlugin()
    const before = stableUses

    for (let i = 0; i < 20; i++) {
      createMarkdownParser({ plugins: [plugin] })
    }

    expect(stableUses - before).toBe(1)
  })

  it('builds one instance per closure when a factory returns a fresh function', () => {
    const before = closureUses

    for (let i = 0; i < 5; i++) {
      createMarkdownParser({ plugins: [closurePlugin()] })
    }

    expect(closureUses - before).toBe(5)
  })

  it('does not share an instance between linkify settings', async () => {
    const withLinkify = await createMarkdownParser({ linkify: true })('See https://comark.dev for more')
    const withoutLinkify = await createMarkdownParser({ linkify: false })('See https://comark.dev for more')

    expect(JSON.stringify(withLinkify.nodes)).toContain('"a"')
    expect(JSON.stringify(withoutLinkify.nodes)).not.toContain('"a"')
  })
})

describe('per-parser state', () => {
  it('keeps streaming state on the parser across another parser use', async () => {
    const streaming = createMarkdownParser()
    const other = createMarkdownParser()

    await streaming('# Title\n\nFirst paragraph.\n', { streaming: true })
    const second = await streaming('# Title\n\nFirst paragraph.\n\nSecond paragraph.\n', { streaming: true })

    await other('Unrelated **document**')

    const third = await streaming('# Title\n\nFirst paragraph.\n\nSecond paragraph.\n\nThird paragraph.\n', {
      streaming: true,
    })

    // Reused nodes are carried over by reference from the previous output.
    expect(third.nodes[0]).toBe(second.nodes[0])
    expect(third.nodes[1]).toBe(second.nodes[1])
    expect(third.nodes).toHaveLength(4)
  })

  it('does not leak frontmatter between two streaming parsers', async () => {
    const a = createMarkdownParser()
    const b = createMarkdownParser()

    await a('---\ntitle: A\n---\n\nAlpha\n', { streaming: true })
    await b('---\ntitle: B\n---\n\nBeta\n', { streaming: true })

    const resultA = await a('---\ntitle: A\n---\n\nAlpha one.\n', { streaming: true })
    const resultB = await b('---\ntitle: B\n---\n\nBeta one.\n', { streaming: true })

    expect(resultA.frontmatter).toEqual({ title: 'A' })
    expect(resultB.frontmatter).toEqual({ title: 'B' })
  })

  it('does not carry a link reference definition into another parser', async () => {
    // Reference definitions live in markdown-it's `env`, which is fresh on
    // every parse. The components plugin claims the `[docs]` syntax, so this
    // runs without the default plugins.
    const definer = createMarkdownParser({ registerDefaultPlugins: false })
    const consumer = createMarkdownParser({ registerDefaultPlugins: false })

    const defined = await definer('[docs]: https://comark.dev\n\nRead the [docs].\n')
    expect(JSON.stringify(defined.nodes)).toContain('https://comark.dev')

    const withoutDefinition = await consumer('Read the [docs].\n')
    expect(JSON.stringify(withoutDefinition.nodes)).not.toContain('https://comark.dev')
  })

  it('parses the same document identically across 50 concurrent parsers', async () => {
    const source = [
      '---',
      'title: Concurrency',
      '---',
      '',
      '# Hello **world**',
      '',
      'Some `code` and a [link](https://comark.dev).',
      '',
      '::alert{type="info"}',
      'Careful.',
      '::',
      '',
      '| a | b |',
      '| - | - |',
      '| 1 | 2 |',
      '',
      '- [ ] todo',
      '- [x] done',
      '',
      '<strong class="bold">html</strong>',
      '',
    ].join('\n')

    const baseline = await createMarkdownParser()(source)
    const results = await Promise.all(Array.from({ length: 50 }, () => createMarkdownParser()(source)))

    for (const result of results) {
      expect(result).toEqual(baseline)
    }
  })
})
