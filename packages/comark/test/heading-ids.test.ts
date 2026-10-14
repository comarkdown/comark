import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse'
import { renderMarkdown } from '../src/render'

describe('headingIds option', () => {
  it('generates id attributes by default', async () => {
    const tree = await parseMarkdown('# Hello World')

    expect(tree.nodes).toEqual([['h1', { id: 'hello-world' }, 'Hello World']])
  })

  it('skips auto-generated ids when headingIds is false', async () => {
    const tree = await parseMarkdown('# Hello World', { headingIds: false })

    expect(tree.nodes).toEqual([['h1', {}, 'Hello World']])
  })

  it('preserves user-supplied id when headingIds is false', async () => {
    const tree = await parseMarkdown('# Hello {id="custom"}', { headingIds: false })

    expect(tree.nodes).toEqual([['h1', { id: 'custom' }, 'Hello']])
  })

  it('uses flat ids by default', async () => {
    const tree = await parseMarkdown('## Setup\n\n### Install')

    const ids = tree.nodes.map((n: any) => n[1].id)
    expect(ids).toEqual(['setup', 'install'])
  })

  it('treats headingIds: true the same as flat', async () => {
    const tree = await parseMarkdown('## Setup\n\n### Install', { headingIds: true })

    const ids = tree.nodes.map((n: any) => n[1].id)
    expect(ids).toEqual(['setup', 'install'])
  })

  it('prefixes parent ids in nested mode', async () => {
    const tree = await parseMarkdown('# Title\n\n## Setup\n\n### Install', { headingIds: 'nested' })

    const ids = tree.nodes.map((n: any) => n[1].id)
    expect(ids).toEqual(['title', 'setup', 'setup-install'])
  })

  it('deduplicates flat ids with a numeric suffix', async () => {
    const tree = await parseMarkdown('## Options\n\n## Options\n\n## Options')

    const ids = tree.nodes.map((n: any) => n[1].id)
    expect(ids).toEqual(['options', 'options-1', 'options-2'])
  })

  it('deduplicates flat ids across different heading levels and sections', async () => {
    const tree = await parseMarkdown('# Install\n\n## Npm\n\n### Install\n\n## Yarn\n\n### Install\n\n#### Npm')

    const ids = tree.nodes.map((n: any) => n[1].id)
    expect(ids).toEqual(['install', 'npm', 'install-1', 'yarn', 'install-2', 'npm-1'])
  })

  it('deduplicates ids from different heading text that slugify the same', async () => {
    const tree = await parseMarkdown('## Hello World\n\n## hello-world\n\n## Hello, World!')

    const ids = tree.nodes.map((n: any) => n[1].id)
    expect(ids).toEqual(['hello-world', 'hello-world-1', 'hello-world-2'])
  })

  it('deduplicates hierarchical ids with a numeric suffix in nested mode', async () => {
    const tree = await parseMarkdown('## Setup\n\n### Install\n\n## Setup\n\n### Install', { headingIds: 'nested' })

    const ids = tree.nodes.map((n: any) => n[1].id)
    expect(ids).toEqual(['setup', 'setup-install', 'setup-1', 'setup-install-1'])
  })

  it('never reuses an id when a suffixed duplicate collides with a literal slug', async () => {
    const flat = await parseMarkdown('## Foo\n\n### Foo\n\n### Foo-1')
    expect(flat.nodes.map((n: any) => n[1].id)).toEqual(['foo', 'foo-1', 'foo-1-1'])

    const nested = await parseMarkdown('# Bar\n\n# Bar\n\n# Bar-1', { headingIds: 'nested' })
    expect(nested.nodes.map((n: any) => n[1].id)).toEqual(['bar', 'bar-1', 'bar-1-1'])

    const reversed = await parseMarkdown('# Foo-1\n\n# Foo\n\n# Foo')
    expect(reversed.nodes.map((n: any) => n[1].id)).toEqual(['foo-1', 'foo', 'foo-2'])
  })

  it('does not reuse an explicit id for a later generated one', async () => {
    const source = '# Foo {#foo-1}\n\n# Foo\n\n# Bar\n\n# Baz {#bar-1}\n\n# Bar'
    const tree = await parseMarkdown(source)
    expect(tree.nodes.map((n: any) => n[1].id)).toEqual(['foo-1', 'foo-2', 'bar', 'bar-1', 'bar-2'])

    // The stringifier replays the same reservation, so the roundtrip is stable.
    const markdown = await renderMarkdown(tree)
    expect(markdown.trim()).toBe(source)
    const reparsed = await parseMarkdown(markdown)
    expect(reparsed.nodes).toEqual(tree.nodes)
  })

  describe('slug text extraction', () => {
    it('does not leak tag names from bold text', async () => {
      const tree = await parseMarkdown('## 1. Never let an LLM **speak** for you')

      expect((tree.nodes[0] as any)[1].id).toBe('_1-never-let-an-llm-speak-for-you')
    })

    it('does not leak tag names from inline code', async () => {
      const tree = await parseMarkdown('## The `parse` function')

      expect((tree.nodes[0] as any)[1].id).toBe('the-parse-function')
    })

    it('does not leak tag names from links', async () => {
      const tree = await parseMarkdown('## See [Nuxt](https://nuxt.com) docs')

      expect((tree.nodes[0] as any)[1].id).toBe('see-nuxt-docs')
    })

    it('does not include inline component names in the slug', async () => {
      const tree = await parseMarkdown('## Star :icon-star here')

      expect((tree.nodes[0] as any)[1].id).toBe('star-here')
    })
  })

  describe('non-ASCII headings', () => {
    it('keeps accented Latin letters', async () => {
      const tree = await parseMarkdown('## Café')

      expect((tree.nodes[0] as any)[1].id).toBe('café')
    })

    it('keeps accented Latin letters across words', async () => {
      const tree = await parseMarkdown('## Ünïcödé Tëxt')

      expect((tree.nodes[0] as any)[1].id).toBe('ünïcödé-tëxt')
    })

    it('keeps Cyrillic letters', async () => {
      const tree = await parseMarkdown('## Привет мир')

      expect((tree.nodes[0] as any)[1].id).toBe('привет-мир')
    })

    it('keeps CJK characters', async () => {
      const tree = await parseMarkdown('## 日本語')

      expect((tree.nodes[0] as any)[1].id).toBe('日本語')
    })

    it('omits the id for a symbol-only heading', async () => {
      const tree = await parseMarkdown('## 🚀')

      expect((tree.nodes[0] as any)[1].id).toBeUndefined()
    })

    it('omits the id for every duplicate symbol-only heading', async () => {
      const tree = await parseMarkdown('## 🚀\n\n## 🚀\n\n## 🚀')

      // The third slugifies to "-2", not just "-1" — none of them is an anchor.
      const ids = tree.nodes.map((n: any) => n[1].id)
      expect(ids).toEqual([undefined, undefined, undefined])
    })

    it('keeps the parent prefix for a non-ASCII child heading', async () => {
      const tree = await parseMarkdown('## Setup\n\n### Café', { headingIds: 'nested' })

      const ids = tree.nodes.map((n: any) => n[1].id)
      expect(ids).toEqual(['setup', 'setup-café'])
    })

    it('does not prefix a child with an empty parent id', async () => {
      const tree = await parseMarkdown('## 🚀\n\n### Café', { headingIds: 'nested' })

      const ids = tree.nodes.map((n: any) => n[1].id)
      expect(ids).toEqual([undefined, 'café'])
    })

    it('omits the id for a symbol-only child of a prefixed parent', async () => {
      const tree = await parseMarkdown('## Setup\n\n### 🚀', { headingIds: 'nested' })

      const ids = tree.nodes.map((n: any) => n[1].id)
      expect(ids).toEqual(['setup', undefined])
    })

    it('omits the id for nested symbol-only headings', async () => {
      const tree = await parseMarkdown('## 🚀\n\n### 🚀', { headingIds: 'nested' })

      const ids = tree.nodes.map((n: any) => n[1].id)
      expect(ids).toEqual([undefined, undefined])
    })

    it('keeps the underscore prefix for a leading digit', async () => {
      const tree = await parseMarkdown('## 2024 résumé')

      expect((tree.nodes[0] as any)[1].id).toBe('_2024-résumé')
    })

    it('does not prefix a leading non-ASCII digit', async () => {
      // U+0661 is a CSS ident start (non-ASCII); only an ASCII digit needs `_`.
      const tree = await parseMarkdown('## ١٢٣ المقدمة')

      expect((tree.nodes[0] as any)[1].id).toBe('١٢٣-المقدمة')
    })

    it('composes a decomposed accent into the same id as the precomposed letter', async () => {
      const precomposed = await parseMarkdown('## Caf\u00e9')
      const decomposed = await parseMarkdown('## Cafe\u0301')

      expect((decomposed.nodes[0] as any)[1].id).toBe('caf\u00e9')
      expect((decomposed.nodes[0] as any)[1].id).toBe((precomposed.nodes[0] as any)[1].id)
    })

    it('drops a leading combining mark so the id stays a valid HTML5 name', async () => {
      const tree = await parseMarkdown('## \u0301accent')

      expect((tree.nodes[0] as any)[1].id).toBe('accent')
    })

    it('drops a combining mark that only becomes leading once hyphens are stripped', async () => {
      const tree = await parseMarkdown('## -\u0301accent')

      expect((tree.nodes[0] as any)[1].id).toBe('accent')
    })

    it('still prefixes a digit when a leading mark hides the hyphen in front of it', async () => {
      // `\u0301-1` strips to `-1` if the mark goes first, which the dedup guard discards.
      const tree = await parseMarkdown('## \u0301-1')

      expect((tree.nodes[0] as any)[1].id).toBe('_1')
    })

    it('drops a trailing hyphen', async () => {
      const tree = await parseMarkdown('## Setup -')

      expect((tree.nodes[0] as any)[1].id).toBe('setup')
    })

    it('slugifies a heading whose text is "-1" to a real id, not the empty-slug suffix', async () => {
      // Leading hyphens are stripped before the digit prefix, so this is `_1`,
      // not the `-1` artifact that only an empty slug's dedup counter produces.
      const tree = await parseMarkdown('## -1')

      expect((tree.nodes[0] as any)[1].id).toBe('_1')
    })

    it('does not let symbol-only headings leak a dedup suffix onto the next real heading', async () => {
      const tree = await parseMarkdown('## 🚀\n\n## ✨\n\n## Café')

      const ids = tree.nodes.map((n: any) => n[1].id)
      expect(ids).toEqual([undefined, undefined, 'café'])
    })
  })
})
