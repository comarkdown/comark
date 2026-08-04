import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import type { ElementNode, MarkdownDocument } from 'comark'

describe('@comark/angular — rendering integration', () => {
  it('parses heading with bold text into correct AST', async () => {
    const tree = await parseMarkdown('# Hello **World**')
    expect(tree.nodes).toBeDefined()
    expect(tree.nodes.length).toBeGreaterThan(0)

    const h1 = tree.nodes[0] as ElementNode
    expect(h1[0]).toBe('h1')
    // h1 should have children including 'Hello ' and a strong element
    expect(h1.length).toBeGreaterThan(2)
  })

  it('parses component with attributes', async () => {
    const tree = await parseMarkdown('::alert{type="warning"}\nContent here\n::')
    const alert = tree.nodes[0] as ElementNode
    expect(alert[0]).toBe('alert')
    expect(alert[1]).toHaveProperty('type', 'warning')
  })

  it('parses nested components', async () => {
    const tree = await parseMarkdown('::outer\n:::inner\nNested\n:::\n::')
    expect(tree.nodes.length).toBeGreaterThan(0)
    const outer = tree.nodes[0] as ElementNode
    expect(outer[0]).toBe('outer')
  })

  it('parses inline code', async () => {
    const tree = await parseMarkdown('Use `const x = 1` in your code')
    expect(tree.nodes.length).toBeGreaterThan(0)
  })

  it('parses links', async () => {
    const tree = await parseMarkdown('[Click here](https://example.com)')
    const p = tree.nodes[0] as ElementNode
    // Should contain an anchor element
    const hasAnchor = JSON.stringify(p).includes('"a"')
    expect(hasAnchor).toBe(true)
  })

  it('parses images', async () => {
    const tree = await parseMarkdown('![Alt text](https://example.com/image.png)')
    const hasImg = JSON.stringify(tree.nodes).includes('"img"')
    expect(hasImg).toBe(true)
  })

  it('parses lists', async () => {
    const tree = await parseMarkdown('- Item 1\n- Item 2\n- Item 3')
    const ul = tree.nodes[0] as ElementNode
    expect(ul[0]).toBe('ul')
  })

  it('parses ordered lists', async () => {
    const tree = await parseMarkdown('1. First\n2. Second\n3. Third')
    const ol = tree.nodes[0] as ElementNode
    expect(ol[0]).toBe('ol')
  })

  it('parses blockquotes', async () => {
    const tree = await parseMarkdown('> This is a quote')
    const bq = tree.nodes[0] as ElementNode
    expect(bq[0]).toBe('blockquote')
  })

  it('parses code blocks', async () => {
    const tree = await parseMarkdown('```js\nconst x = 1\n```')
    const pre = tree.nodes[0] as ElementNode
    expect(pre[0]).toBe('pre')
  })

  it('parses horizontal rules', async () => {
    const tree = await parseMarkdown('---')
    const hr = tree.nodes[0] as ElementNode
    expect(hr[0]).toBe('hr')
  })

  it('handles empty input', async () => {
    const tree = await parseMarkdown('')
    expect(tree.nodes).toBeDefined()
    expect(tree.nodes.length).toBe(0)
  })

  it('handles streaming mode', async () => {
    const tree = await parseMarkdown('Hello **wor', { autoClose: true })
    expect(tree.nodes).toBeDefined()
    expect(tree.nodes.length).toBeGreaterThan(0)
  })

  it('parses component with named slots', async () => {
    const md = `::card
#title
Card Title

#default
Card content
::`
    const tree = await parseMarkdown(md)
    expect(tree.nodes.length).toBeGreaterThan(0)
    const card = tree.nodes[0] as ElementNode
    expect(card[0]).toBe('card')
  })

  it('parses tables', async () => {
    const tree = await parseMarkdown('| A | B |\n|---|---|\n| 1 | 2 |')
    const table = tree.nodes[0] as ElementNode
    expect(table[0]).toBe('table')
  })

  it('generates correct tree shape for renderer consumption', async () => {
    const tree: MarkdownDocument = await parseMarkdown('# Title\n\nParagraph with **bold** and *italic*.')
    expect(tree).toHaveProperty('nodes')
    expect(tree).toHaveProperty('frontmatter')
    expect(tree).toHaveProperty('meta')
    expect(Array.isArray(tree.nodes)).toBe(true)

    // h1
    const h1 = tree.nodes[0] as ElementNode
    expect(h1[0]).toBe('h1')

    // paragraph
    const p = tree.nodes[1] as ElementNode
    expect(p[0]).toBe('p')
  })
})
