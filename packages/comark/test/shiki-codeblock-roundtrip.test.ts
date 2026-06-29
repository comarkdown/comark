import { describe, expect, it } from 'vitest'
import type { ComarkTree } from '../src/types'
import { renderMarkdown } from '../src/render'

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
})
