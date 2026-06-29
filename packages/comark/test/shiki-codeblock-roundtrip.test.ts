import { describe, expect, it } from 'vitest'
import type { ComarkTree } from '../src/types'
import { renderMarkdown } from '../src/render'
import { highlightCodeBlocks } from '../src/plugins/highlight'

describe('shiki code block round-trip', () => {
  // A highlighted code block is just a `pre.shiki` wrapper around a `code`
  // node. Its `class`/`style`/`language` are injected by the highlight plugin
  // at render time and have no markdown form, so the block must serialize back
  // to a plain fence — never the `::pre{...}` block-attribute wrapper.
  function preTree(preClass: string): ComarkTree {
    return {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'bash', class: preClass }, ['code', { class: 'language-bash' }, 'npx install']]],
    }
  }

  it('serializes a bare `shiki` class back to a plain fence', async () => {
    // Single-theme shiki emits a bare `class="shiki"` with no trailing tokens.
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
    const tree: ComarkTree = {
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

  it('serializes a `pre` carrying a `code` fence-body attr to a plain fence', async () => {
    // Editors (e.g. round-tripping through a WYSIWYG layer) preserve the raw
    // source as a `code` attr while the children hold highlighted spans. The
    // `pre` handler reads `node[1].code` as the fence body, so it must not also
    // echo back as a `::pre{code="…"}` wrapper attr.
    const tree: ComarkTree = {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'bash', class: 'shiki', code: 'npx install' }, ['code', {}, 'npx install']]],
    }
    const md = await renderMarkdown(tree)
    expect(md).not.toContain('::pre')
    expect(md.trim()).toBe('```bash\nnpx install\n```')
  })

  it('re-highlighting an already-highlighted block is idempotent', async () => {
    // Studio stores a highlighted block, then re-highlights after a tiptap
    // edit round-trip. The injected `shiki` class must not accumulate as
    // `shiki . shiki` and leak back out as a `::pre{.shiki}` wrapper.
    const tree: ComarkTree = {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'bash' }, ['code', { class: 'language-bash' }, 'npx install']]],
    }
    const once = await highlightCodeBlocks(tree, {})
    const twice = await highlightCodeBlocks(once, {})

    const onceClass = (once.nodes[0] as [string, Record<string, unknown>])[1].class as string
    const twiceClass = (twice.nodes[0] as [string, Record<string, unknown>])[1].class as string
    // Stable across passes, with no ` . ` user-class sentinel accumulating.
    expect(twiceClass).toBe(onceClass)
    expect(twiceClass).not.toContain(' . ')

    const md = await renderMarkdown(twice)
    expect(md).not.toContain('::pre')
    expect(md.trim()).toBe('```bash\nnpx install\n```')
  })

  it('preserves a genuine user class across re-highlighting', async () => {
    const tree: ComarkTree = {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'bash', class: 'my-class' }, ['code', { class: 'language-bash' }, 'npx install']]],
    }
    const once = await highlightCodeBlocks(tree, {})
    const twice = await highlightCodeBlocks(once, {})

    // Stable across passes — no `shiki` accumulation, user class retained.
    expect((once.nodes[0] as [string, Record<string, unknown>])[1].class).toBe(
      (twice.nodes[0] as [string, Record<string, unknown>])[1].class
    )

    const md = await renderMarkdown(twice)
    expect(md).toContain('::pre{.my-class}')
  })
})
