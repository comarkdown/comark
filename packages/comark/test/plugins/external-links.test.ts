import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/index'
import externalLinks from '../../src/plugins/external-links'
import { renderMarkdown } from '../../src/render'
import { renderHtmlForTest } from '../utils/render-html'

const LINKS = `[External](https://nuxt.com) [Insecure](http://nuxt.com) [Internal](/about) [Hash](#top) <https://auto.dev>

[Sponsored](https://sponsor.dev){rel="sponsored"} [Nofollow](https://nofollow.dev){rel="nofollow"}

Raw <a href="https://html.dev">HTML</a> link`

describe('external-links plugin', () => {
  it('adds `rel="nofollow"` to external links without a `rel`, and keeps the one the author wrote', async () => {
    const tree = await parseMarkdown(LINKS, { plugins: [externalLinks()] })

    expect(await renderHtmlForTest(tree)).toBe(
      [
        '<p><a href="https://nuxt.com" rel="nofollow">External</a> <a href="http://nuxt.com" rel="nofollow">Insecure</a> <a href="/about">Internal</a> <a href="#top">Hash</a> <a href="https://auto.dev" rel="nofollow">https://auto.dev</a></p>',
        '<p><a href="https://sponsor.dev" rel="sponsored">Sponsored</a> <a href="https://nofollow.dev" rel="nofollow">Nofollow</a></p>',
        '<p>Raw <a href="https://html.dev" rel="nofollow">HTML</a> link</p>',
      ].join('\n')
    )
  })

  it('adds a custom `rel`', async () => {
    const tree = await parseMarkdown('[Nuxt](https://nuxt.com)', {
      plugins: [externalLinks({ rel: 'nofollow noopener' })],
    })

    expect(tree.nodes[0]).toEqual([
      'p',
      {},
      ['a', { href: 'https://nuxt.com', rel: 'nofollow noopener', $: { autoRel: 'nofollow noopener' } }, 'Nuxt'],
    ])
  })

  it('leaves the added `rel` out of Markdown output, so round-trips stay stable', async () => {
    const plugins = [externalLinks()]
    const once = await renderMarkdown(await parseMarkdown(LINKS, { plugins }))

    expect(once).toBe(LINKS)
    expect(await renderMarkdown(await parseMarkdown(once, { plugins }))).toBe(LINKS)
  })

  it('writes a `rel` changed after parsing', async () => {
    const tree = await parseMarkdown('[Nuxt](https://nuxt.com)', { plugins: [externalLinks()] })
    ;(tree.nodes[0] as any[])[2][1].rel = 'sponsored'

    expect(await renderMarkdown(tree)).toBe('[Nuxt](https://nuxt.com){rel="sponsored"}')
  })
})
