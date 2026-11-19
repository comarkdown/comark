import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/index'
import externalLinks from '../../src/plugins/external-links'
import { renderMarkdown } from '../../src/render'
import { renderHtmlForTest } from '../utils/render-html'

const LINKS = `[External](https://nuxt.com) [Insecure](http://nuxt.com) [Internal](/about) [Hash](#top) <https://auto.dev> [Relative](//relative.dev)

[Sponsored](https://sponsor.dev){rel="sponsored"} [Nofollow](https://nofollow.dev){rel="nofollow"} [Blank](https://blank.dev){target="_blank"} [Upper](https://upper.dev){target="_SELF"} [Empty](https://empty.dev){target=""}

Raw <a href="https://html.dev">HTML</a> link`

describe('external-links plugin', () => {
  it('adds `rel="nofollow"` to external links without a `rel`, plus `noopener noreferrer` on links that open a new tab', async () => {
    const tree = await parseMarkdown(LINKS, { plugins: [externalLinks()] })

    expect(await renderHtmlForTest(tree)).toBe(
      [
        '<p><a href="https://nuxt.com" rel="nofollow">External</a> <a href="http://nuxt.com" rel="nofollow">Insecure</a> <a href="/about">Internal</a> <a href="#top">Hash</a> <a href="https://auto.dev" rel="nofollow">https://auto.dev</a> <a href="//relative.dev" rel="nofollow">Relative</a></p>',
        '<p><a href="https://sponsor.dev" rel="sponsored">Sponsored</a> <a href="https://nofollow.dev" rel="nofollow">Nofollow</a> <a href="https://blank.dev" target="_blank" rel="nofollow noopener noreferrer">Blank</a> <a href="https://upper.dev" target="_SELF" rel="nofollow">Upper</a> <a href="https://empty.dev" target="" rel="nofollow">Empty</a></p>',
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

  it('adds a `target` with `noopener noreferrer`, and keeps the `rel` and `target` the author wrote', async () => {
    const source = `[Nuxt](https://nuxt.com) [Internal](/about) [Sponsored](https://sponsor.dev){rel="sponsored"} [Self](https://self.dev){target="_self"}

Raw <a href="https://html.dev">HTML</a> link`
    const plugins = [externalLinks({ target: '_blank' })]
    const tree = await parseMarkdown(source, { plugins })

    expect(await renderHtmlForTest(tree)).toBe(
      [
        '<p><a href="https://nuxt.com" rel="nofollow noopener noreferrer" target="_blank">Nuxt</a> <a href="/about">Internal</a> <a href="https://sponsor.dev" rel="sponsored" target="_blank">Sponsored</a> <a href="https://self.dev" target="_self" rel="nofollow">Self</a></p>',
        '<p>Raw <a href="https://html.dev" rel="nofollow noopener noreferrer" target="_blank">HTML</a> link</p>',
      ].join('\n')
    )
    expect(await renderMarkdown(tree)).toBe(source)
  })

  it('keeps a bound `:rel`', async () => {
    const source = '---\nlinkRel: sponsored\n---\n\n[Nuxt](https://nuxt.com){:rel="frontmatter.linkRel"}'
    const tree = await parseMarkdown(source, { plugins: [externalLinks()] })

    expect(await renderHtmlForTest(tree)).toBe('<p><a href="https://nuxt.com" rel="sponsored">Nuxt</a></p>')
  })

  it('writes a `rel` changed after parsing', async () => {
    const tree = await parseMarkdown('[Nuxt](https://nuxt.com)', { plugins: [externalLinks()] })
    ;(tree.nodes[0] as any[])[2][1].rel = 'sponsored'

    expect(await renderMarkdown(tree)).toBe('[Nuxt](https://nuxt.com){rel="sponsored"}')
  })
})
