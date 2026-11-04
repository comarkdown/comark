import { describe, expect, it } from 'vitest'
import { createMarkdownParser, parseMarkdown } from '../../src/index'
import headingLinks from '../../src/plugins/heading-links'
import titleDescription from '../../src/plugins/title-description'
import html from '../../src/plugins/html'
import toc from '../../src/plugins/toc'
import { renderMarkdown } from '../../src/render'
import { renderHtmlForTest } from '../utils/render-html'

const LEVELS = `# One

## Two

### Three

#### Four

##### Five
`

describe('heading-links plugin', () => {
  it('wraps h2 to h4 in a link to their id by default, and leaves h1 and h5 alone', async () => {
    const tree = await parseMarkdown(LEVELS, { plugins: [headingLinks()] })

    expect(await renderHtmlForTest(tree)).toBe(
      [
        '<h1 id="one">One</h1>',
        '<h2 id="two"><a href="#two">Two</a></h2>',
        '<h3 id="three"><a href="#three">Three</a></h3>',
        '<h4 id="four"><a href="#four">Four</a></h4>',
        '<h5 id="five">Five</h5>',
      ].join('\n')
    )
  })

  it('links only the configured tags', async () => {
    const tree = await parseMarkdown(LEVELS, { plugins: [headingLinks({ tags: ['h1', 'h5'] })] })

    expect(tree.nodes).toEqual([
      ['h1', { id: 'one' }, ['a', { href: '#one', $: { permalink: 'wrap' } }, 'One']],
      ['h2', { id: 'two' }, 'Two'],
      ['h3', { id: 'three' }, 'Three'],
      ['h4', { id: 'four' }, 'Four'],
      ['h5', { id: 'five' }, ['a', { href: '#five', $: { permalink: 'wrap' } }, 'Five']],
    ])
  })

  it('keeps inline content inside the link', async () => {
    const tree = await parseMarkdown('## Use `parse` *now*', { plugins: [headingLinks()] })

    expect(tree.nodes[0]).toEqual([
      'h2',
      { id: 'use-parse-now' },
      [
        'a',
        { href: '#use-parse-now', $: { permalink: 'wrap' } },
        'Use ',
        ['code', {}, 'parse'],
        ' ',
        ['em', {}, 'now'],
      ],
    ])
  })

  it('links headings nested inside components', async () => {
    const tree = await parseMarkdown('::callout\n## Inside\n::', { plugins: [headingLinks()] })

    expect(tree.nodes[0]).toEqual([
      'callout',
      {},
      ['h2', { id: 'inside' }, ['a', { href: '#inside', $: { permalink: 'wrap' } }, 'Inside']],
    ])
  })

  it('does not nest a link inside a heading that already contains one', async () => {
    const tree = await parseMarkdown('## See [the docs](https://comark.dev)', { plugins: [headingLinks()] })

    expect(tree.nodes[0]).toEqual([
      'h2',
      { id: 'see-the-docs' },
      'See ',
      ['a', { href: 'https://comark.dev' }, 'the docs'],
    ])
  })

  it('prepends or appends a separate link with custom content and props', async () => {
    const props = { class: 'heading-link', 'aria-hidden': 'true' }
    const prepended = await parseMarkdown('## Setup', { plugins: [headingLinks({ behavior: 'prepend', props })] })
    const appended = await parseMarkdown('## Setup', {
      plugins: [headingLinks({ behavior: 'append', content: [['span', { class: 'icon' }]] })],
    })

    expect(prepended.nodes[0]).toEqual([
      'h2',
      { id: 'setup' },
      ['a', { class: 'heading-link', 'aria-hidden': 'true', href: '#setup', $: { permalink: 'separate' } }, '#'],
      'Setup',
    ])
    expect(appended.nodes[0]).toEqual([
      'h2',
      { id: 'setup' },
      'Setup',
      ['a', { href: '#setup', $: { permalink: 'separate' } }, ['span', { class: 'icon' }]],
    ])
  })

  it('gives each link its own copy of the content', async () => {
    const tree = await parseMarkdown('## A\n\n## B', {
      plugins: [headingLinks({ behavior: 'append', content: [['span', { class: 'icon' }]] })],
    })
    const [first, second] = tree.nodes as any[]

    first[3][2][1].class = 'changed'

    expect(second[3][2][1].class).toBe('icon')
  })

  it('adds a single link when streaming reuses a heading from the previous parse', async () => {
    for (const behavior of ['wrap', 'prepend', 'append'] as const) {
      const parse = createMarkdownParser({ plugins: [headingLinks({ behavior })] })
      let tree
      for (const chunk of ['## A\n\nOne', '## A\n\nOne\n\nTwo', '## A\n\nOne\n\nTwo\n\nThree']) {
        tree = await parse(chunk, { streaming: true })
      }
      const links = (tree!.nodes[0] as any[])
        .slice(2)
        .flat(Infinity)
        .filter((n) => n === 'a')

      expect(links, behavior).toHaveLength(1)
    }
  })

  it('keeps the permalink out of toc labels, the title and the description, in any plugin order', async () => {
    const doc = '# Title\n\n## Subtitle\n\n## Use `parse`\n\n## See [details](#see-details)\n\nOne'
    for (const behavior of ['wrap', 'prepend', 'append'] as const) {
      const links = headingLinks({ behavior, tags: ['h1', 'h2'] })
      for (const plugins of [
        [links, toc(), titleDescription({ descriptionTag: 'h2' })],
        [toc(), titleDescription({ descriptionTag: 'h2' }), links],
      ]) {
        const parse = createMarkdownParser({ plugins })
        for (const chunk of [doc, `${doc}\n\nTwo`]) {
          const tree = await parse(chunk, { streaming: true })

          expect(
            tree.meta.toc.links.map((l: { text: string }) => l.text),
            behavior
          ).toEqual(['Subtitle', 'Use parse', 'See details'])
          expect(tree.meta.title, behavior).toBe('Title')
          expect(tree.meta.description, behavior).toBe('Subtitle')
        }
      }
    }
  })

  it('adds a separate link next to a link the author wrote to the same heading', async () => {
    const tree = await parseMarkdown('## See [details](#see-details)', {
      plugins: [headingLinks({ behavior: 'prepend' })],
    })

    expect(tree.nodes[0]).toEqual([
      'h2',
      { id: 'see-details' },
      ['a', { href: '#see-details', $: { permalink: 'separate' } }, '#'],
      'See ',
      ['a', { href: '#see-details' }, 'details'],
    ])
  })

  it('leaves the added links out of Markdown output, so round-trips stay stable', async () => {
    const cases = [
      ...(['wrap', 'prepend', 'append'] as const).map((behavior) => ({
        doc: '## Use `parse`\n\n## See [details](#see-details)\n\nText',
        base: [],
        links: headingLinks({ behavior }),
      })),
      // The explicit id must survive, although the dropped link's text matched it
      { doc: '## Foo {#linkfoo}', base: [], links: headingLinks({ behavior: 'prepend', content: ['link'] }) },
      // Raw HTML heading text must not gain escapes
      { doc: '<h2 id="x">Use *stars*</h2>', base: [html({ markdown: false })], links: headingLinks() },
    ]
    for (const { doc, base, links } of cases) {
      const plugins = [...base, links]
      const expected = await renderMarkdown(await parseMarkdown(doc, { plugins: base }))
      const once = await renderMarkdown(await parseMarkdown(doc, { plugins }))
      const twice = await renderMarkdown(await parseMarkdown(once, { plugins }))

      expect(once, doc).toBe(expected)
      expect(twice, doc).toBe(expected)
    }
  })
})
