import { describe, expect, it } from 'vitest'
import type { MarkdownElement, MarkdownTree } from '../../src/types'
import { parse } from '../../src'
import { renderMarkdown } from '../../src/render'
import highlight from '../../src/plugins/highlight'

describe('highlight themes option', () => {
  it('accepts bundled theme names as strings', async () => {
    const tree = await parse('```js\nconst a = 1\n```', {
      plugins: [highlight({ themes: { light: 'github-light', dark: 'github-dark' } })],
    })
    const pre = tree.nodes[0] as MarkdownElement
    expect((pre[1] as Record<string, any>).class).toContain('shiki-themes github-light github-dark')

    const code = pre[2] as MarkdownElement
    const line = code[2] as MarkdownElement
    expect(line[0]).toBe('span')
    const tokens = line.slice(2) as MarkdownElement[]
    expect(tokens.length).toBeGreaterThan(1)
    for (const token of tokens) {
      expect(token[0]).toBe('span')
      expect((token[1] as Record<string, any>).style).toMatch(/color:#[0-9A-Fa-f]{3,8}/)
      expect((token[1] as Record<string, any>).style).toContain('--shiki-dark:')
    }
  })

  it('throws on an unknown bundled theme name', async () => {
    await expect(
      parse('```js\nconst a = 1\n```', {
        plugins: [highlight({ themes: { light: 'not-a-real-theme' } })],
      })
    ).rejects.toThrow('Unknown bundled theme')
  })
})

describe('shiki code block round-trip', () => {
  // The highlight plugin's injected attrs have no markdown form, so a
  // highlighted block must serialize to a plain fence, never a `::pre{...}`.
  function preTree(preClass: string): MarkdownTree {
    return {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'bash', class: preClass }, ['code', { class: 'language-bash' }, 'npx install']]],
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
    const tree: MarkdownTree = {
      frontmatter: {},
      meta: {},
      nodes: [
        [
          'code-preview',
          {},
          [
            'template',
            { name: 'code' },
            ['pre', { language: 'bash', class: 'shiki' }, ['code', { class: 'language-bash' }, 'npx install']],
          ],
        ],
      ],
    }
    const md = await renderMarkdown(tree)
    expect(md).not.toContain('::pre')
    expect(md).toContain('```bash\nnpx install\n```')
  })
})
