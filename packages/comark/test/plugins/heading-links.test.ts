import { describe, expect, it } from 'vitest'
import { createMarkdownParser, parseMarkdown } from '../../src/parse'
import headingLinks from '../../src/plugins/heading-links'
import titleDescription from '../../src/plugins/title-description'
import toc from '../../src/plugins/toc'
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
      ['h1', { id: 'one' }, ['a', { href: '#one' }, 'One']],
      ['h2', { id: 'two' }, 'Two'],
      ['h3', { id: 'three' }, 'Three'],
      ['h4', { id: 'four' }, 'Four'],
      ['h5', { id: 'five' }, ['a', { href: '#five' }, 'Five']],
    ])
  })

  it('keeps inline content inside the link', async () => {
    const tree = await parseMarkdown('## Use `parse` *now*', { plugins: [headingLinks()] })

    expect(tree.nodes[0]).toEqual([
      'h2',
      { id: 'use-parse-now' },
      ['a', { href: '#use-parse-now' }, 'Use ', ['code', {}, 'parse'], ' ', ['em', {}, 'now']],
    ])
  })

  it('links headings nested inside components', async () => {
    const tree = await parseMarkdown('::callout\n## Inside\n::', { plugins: [headingLinks()] })

    expect(tree.nodes[0]).toEqual(['callout', {}, ['h2', { id: 'inside' }, ['a', { href: '#inside' }, 'Inside']]])
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
      ['a', { class: 'heading-link', 'aria-hidden': 'true', href: '#setup' }, '#'],
      'Setup',
    ])
    expect(appended.nodes[0]).toEqual([
      'h2',
      { id: 'setup' },
      'Setup',
      ['a', { href: '#setup' }, ['span', { class: 'icon' }]],
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

  it('keeps the permalink out of toc labels and the page title, in any plugin order', async () => {
    for (const behavior of ['wrap', 'prepend', 'append'] as const) {
      const links = headingLinks({ behavior, tags: ['h1', 'h2'] })
      for (const plugins of [
        [links, toc(), titleDescription()],
        [toc(), titleDescription(), links],
      ]) {
        const parse = createMarkdownParser({ plugins })
        for (const chunk of ['# Title\n\n## Use `parse`\n\nOne', '# Title\n\n## Use `parse`\n\nOne\n\nTwo']) {
          const tree = await parse(chunk, { streaming: true })

          expect(
            tree.meta.toc.links.map((l: { text: string }) => l.text),
            behavior
          ).toEqual(['Use parse'])
          expect(tree.meta.title, behavior).toBe('Title')
        }
      }
    }
  })
})
