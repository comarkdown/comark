import { describe, expect, it } from 'vitest'
import type { MarkdownDocument } from '../../src/types'
import { renderMarkdown } from '../../src/render'
import { parseMarkdown } from '../../src/index'
import shiki from '../../src/plugins/shiki'

describe('shiki code block round-trip', () => {
  // The highlight plugin's injected attrs have no markdown form, so a
  // highlighted block must serialize to a plain fence, never a `::pre{...}`.
  // `$.class` is what the plugin records: the author's own class, empty here.
  function preTree(preClass: string): MarkdownDocument {
    return {
      frontmatter: {},
      meta: {},
      nodes: [
        [
          'pre',
          { language: 'bash', class: preClass, $: { class: '' } },
          ['code', { class: 'language-bash' }, 'npx install'],
        ],
      ],
    }
  }

  it('serializes a bare `shiki` class back to a plain fence', async () => {
    // Single-theme shiki emits a bare `class="shiki"`.
    const md = await renderMarkdown(preTree('shiki'))
    expect(md.trim()).toBe('```bash\nnpx install\n```')
    expect(md).not.toContain('::pre')
  })

  it('serializes a multi-token shiki class back to a plain fence', async () => {
    // Dual-theme shiki emits `shiki shiki-themes <theme> dark:<theme>`.
    const md = await renderMarkdown(preTree('shiki shiki-themes github-dark dark:github-dark'))
    expect(md.trim()).toBe('```bash\nnpx install\n```')
    expect(md).not.toContain('::pre')
  })

  it('keeps a plain fence for a highlighted code block inside a component slot', async () => {
    const document: MarkdownDocument = {
      frontmatter: {},
      meta: {},
      nodes: [
        [
          'code-preview',
          {},
          [
            'template',
            { name: 'code' },
            [
              'pre',
              { language: 'bash', class: 'shiki', $: { class: '' } },
              ['code', { class: 'language-bash' }, 'npx install'],
            ],
          ],
        ],
      ],
    }
    const md = await renderMarkdown(document)
    expect(md).not.toContain('::pre')
    expect(md).toContain('```bash\nnpx install\n```')
  })
})

describe('shiki inline code round-trip', () => {
  // The plugin takes the node's `class` over and records the author's own class
  // in `$`, so a highlighted span serializes back to `` `text`{lang=…} `` rather
  // than leaking `.shiki.shiki-themes…`.
  function inlineTree(codeClass: string, userClass: string): MarkdownDocument {
    return {
      frontmatter: {},
      meta: {},
      nodes: [
        [
          'p',
          {},
          'Type ',
          [
            'code',
            { lang: 'ts-type', class: codeClass, $: { class: userClass } },
            ['span', { style: 'color:#B392F0' }, 'Ref'],
            ['span', { style: 'color:#E1E4E8' }, '<T>'],
          ],
        ],
      ],
    }
  }

  it('puts back the class recorded in $', async () => {
    const md = await renderMarkdown(inlineTree('shiki shiki-themes github-dark foo', 'foo'))
    expect(md).toBe('Type `Ref<T>`{lang="ts-type" .foo}')
    expect(md).not.toContain('.shiki')
  })

  it('drops the class entirely when the author wrote none', async () => {
    const md = await renderMarkdown(inlineTree('shiki shiki-themes github-dark', ''))
    expect(md).toBe('Type `Ref<T>`{lang="ts-type"}')
  })

  it('round-trips a parsed document unchanged', async () => {
    const source = 'Mix `a`{lang="ts-type"} and `<b />`{lang="vue-html"} and `plain` here'
    const document = await parseMarkdown(source, { plugins: [shiki()] })
    expect(await renderMarkdown(document)).toBe(source)
  })
})

describe('user class recorded in $', () => {
  // Stringify never inspects the class string. `$.class` is the author's class
  // verbatim, so anything a highlighter injected is dropped and anything the
  // author wrote is kept, whatever it is named.
  function render(node: MarkdownDocument['nodes'][number]) {
    return renderMarkdown({ frontmatter: {}, meta: {}, nodes: [node] })
  }

  it('serializes a highlighted block with no user class as a plain fence', async () => {
    const md = await render(['pre', { language: 'ts', class: 'shiki themes', $: { class: '' } }, ['code', {}, 'x']])
    expect(md.trim()).toBe('```ts\nx\n```')
  })

  it('keeps the user class on a highlighted block', async () => {
    const md = await render([
      'pre',
      { language: 'ts', class: 'shiki themes foo', $: { class: 'foo' } },
      ['code', {}, 'x'],
    ])
    expect(md.trim()).toBe('::pre{.foo}\n```ts\nx\n```\n::')
  })

  it('keeps the user class on highlighted inline code', async () => {
    const md = await render(['p', {}, ['code', { lang: 'ts', class: 'shiki themes foo', $: { class: 'foo' } }, 'x']])
    expect(md).toBe('`x`{lang="ts" .foo}')
  })

  it('leaves an authored `.shiki` on unhighlighted inline code alone', async () => {
    expect(await render(['p', {}, ['code', { class: 'shiki' }, 'x']])).toBe('`x`{.shiki}')
    // Multi-class attrs always stringify without separators, highlighter or not.
    expect(await render(['p', {}, ['code', { class: 'shiki foo' }, 'x']])).toBe('`x`{.shiki.foo}')
  })

  it('leaves an authored class that starts with a highlighter prefix alone', async () => {
    expect(await render(['pre', { language: 'ts', class: 'shiki-custom' }, ['code', {}, 'x']])).toContain(
      '::pre{.shiki-custom}'
    )
    expect(await render(['p', {}, ['code', { lang: 'ts', class: 'shj-custom' }, 'x']])).toBe(
      '`x`{lang="ts" .shj-custom}'
    )
  })

  it('serializes rangi output as a plain fence, whatever the class prefix', async () => {
    expect(
      await render(['pre', { language: 'ts', class: 'shj shiki shj-lang-ts', $: { class: '' } }, ['code', {}, 'x']])
    ).not.toContain('::pre')
    expect(
      await render(['pre', { language: 'ts', class: 'myhl shiki shj-lang-ts', $: { class: '' } }, ['code', {}, 'x']])
    ).not.toContain('::pre')
  })

  it('round-trips an authored `.shiki` through the plugin', async () => {
    for (const source of ['`x`{.shiki}', '`x`{.shiki.foo}', '`x`{.shiki-custom}']) {
      const document = await parseMarkdown(source, { plugins: [shiki()] })
      expect(await renderMarkdown(document)).toBe(source)
    }
  })
})
