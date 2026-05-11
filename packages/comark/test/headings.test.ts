import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'
import headings from '../src/plugins/headings'

const CONTENT = `# My Page Title

This is the description paragraph.

## Section One

More content here.
`

describe('headings plugin', () => {
  it('extracts title and description into meta', async () => {
    const tree = await parse(CONTENT, { plugins: [headings()] })

    expect(tree.meta.title).toBe('My Page Title')
    expect(tree.meta.description).toBe('This is the description paragraph.')
  })

  it('keeps extracted nodes in the tree by default (remove: false)', async () => {
    const tree = await parse(CONTENT, { plugins: [headings()] })

    const tags = tree.nodes.filter((n) => Array.isArray(n)).map((n) => (n as any)[0])

    expect(tags).toContain('h1')
    expect(tags).toContain('p')
  })

  it('removes extracted nodes when remove: true', async () => {
    const tree = await parse(CONTENT, { plugins: [headings({ remove: true })] })

    expect(tree.meta.title).toBe('My Page Title')
    expect(tree.meta.description).toBe('This is the description paragraph.')

    const tags = tree.nodes.filter((n) => Array.isArray(n)).map((n) => (n as any)[0])

    expect(tags).not.toContain('h1')
    expect(tags).toContain('h2')
    // The first <p> (description) should be removed, but the second section content stays
    const paragraphs = tree.nodes.filter((n) => Array.isArray(n) && (n as any)[0] === 'p')
    expect(
      paragraphs.every((p) => {
        const text = Array.isArray(p) && p.length > 2 ? String(p[2]) : ''
        return text !== 'This is the description paragraph.'
      })
    ).toBe(true)
  })

  it('does not set meta.title when no matching tag exists', async () => {
    const tree = await parse('Just a paragraph.\n', { plugins: [headings()] })

    expect(tree.meta.title).toBeUndefined()
    expect(tree.meta.description).toBe('Just a paragraph.')
  })

  it('uses custom titleTag and descriptionTag', async () => {
    const md = `## Custom Title

> Lead-in quote as description.

More content.
`
    const tree = await parse(md, {
      plugins: [headings({ titleTag: 'h2', descriptionTag: 'blockquote' })],
    })

    expect(tree.meta.title).toBe('Custom Title')
    expect(tree.meta.description).toBe('Lead-in quote as description.')
  })
})
