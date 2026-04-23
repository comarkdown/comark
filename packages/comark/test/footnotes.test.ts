import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'
import footnotes, { Footnote } from '../src/plugins/footnotes'
import { renderMarkdown } from '../src/render'

describe('footnotes plugin', () => {
  it('should parse a simple footnote reference and definition', async () => {
    const md = `Hello world[^1]

[^1]: This is a footnote`

    const tree = await parse(md, { plugins: [footnotes()] })

    // Should have the paragraph with the footnote ref and the footnotes section
    expect(tree.nodes.length).toBeGreaterThanOrEqual(2)

    // Find the footnote reference in the tree
    const firstNode = tree.nodes[0]
    expect(Array.isArray(firstNode)).toBe(true)

    // Find the footnotes section
    const section = tree.nodes.find(
      (n) => Array.isArray(n) && n[0] === 'section' && (n[1] as any)?.class === 'footnotes'
    )
    expect(section).toBeTruthy()
  })

  it('should create sup > a elements for references', async () => {
    const md = `Text[^note]

[^note]: A note`

    const tree = await parse(md, { plugins: [footnotes()] })

    // Find the sup element somewhere in the tree
    function findNode(nodes: any[], tag: string): any {
      for (const node of nodes) {
        if (Array.isArray(node) && node[0] === tag) return node
        if (Array.isArray(node)) {
          const found = findNode(node.slice(2), tag)
          if (found) return found
        }
      }
      return null
    }

    const sup = findNode(tree.nodes, 'sup')
    expect(sup).toBeTruthy()
    expect((sup[1] as any).class).toBe('footnote-ref')

    const a = sup[2]
    expect(Array.isArray(a)).toBe(true)
    expect(a[0]).toBe('a')
    expect((a[1] as any).href).toBe('#fn-note')
    expect((a[1] as any).id).toBe('fnref-note')
    expect(a[2]).toBe('[1]')
  })

  it('should handle multiple footnotes', async () => {
    const md = `First[^1] and second[^2]

[^1]: First note
[^2]: Second note`

    const tree = await parse(md, { plugins: [footnotes()] })

    const section = tree.nodes.find((n) => Array.isArray(n) && n[0] === 'section') as any[]
    expect(section).toBeTruthy()

    // Find the ol element
    const ol = section.find((n: any, i: number) => i >= 2 && Array.isArray(n) && n[0] === 'ol')
    expect(ol).toBeTruthy()

    // Count li items
    const lis = ol.slice(2).filter((n: any) => Array.isArray(n) && n[0] === 'li')
    expect(lis.length).toBe(2)

    expect((lis[0][1] as any).id).toBe('fn-1')
    expect((lis[1][1] as any).id).toBe('fn-2')
  })

  it('should create back-reference links', async () => {
    const md = `Text[^1]

[^1]: Note content`

    const tree = await parse(md, { plugins: [footnotes()] })

    const section = tree.nodes.find((n) => Array.isArray(n) && n[0] === 'section') as any[]

    const ol = section.find((n: any, i: number) => i >= 2 && Array.isArray(n) && n[0] === 'ol')
    const li = ol[2]

    // Find the backref link
    const backref = li
      .slice(2)
      .find((n: any) => Array.isArray(n) && n[0] === 'a' && (n[1] as any)?.class === 'footnote-backref')
    expect(backref).toBeTruthy()
    expect((backref[1] as any).href).toBe('#fnref-1')
    expect(backref[2]).toBe('↩')
  })

  it('should use custom backRef symbol', async () => {
    const md = `Text[^1]

[^1]: Note`

    const tree = await parse(md, { plugins: [footnotes({ backRef: '⬆' })] })

    function findNode(nodes: any[], predicate: (n: any) => boolean): any {
      for (const node of nodes) {
        if (predicate(node)) return node
        if (Array.isArray(node)) {
          const found = findNode(node.slice(2), predicate)
          if (found) return found
        }
      }
      return null
    }

    const backref = findNode(
      tree.nodes,
      (n: any) => Array.isArray(n) && n[0] === 'a' && (n[1] as any)?.class === 'footnote-backref'
    )
    expect(backref[2]).toBe('⬆')
  })

  it('should add hr before footnotes by default', async () => {
    const md = `Text[^1]

[^1]: Note`

    const tree = await parse(md, { plugins: [footnotes()] })

    const section = tree.nodes.find((n) => Array.isArray(n) && n[0] === 'section') as any[]

    const hrNode = section.find((n: any, i: number) => i >= 2 && Array.isArray(n) && n[0] === 'hr')
    expect(hrNode).toBeTruthy()
  })

  it('should skip hr when hr: false', async () => {
    const md = `Text[^1]

[^1]: Note`

    const tree = await parse(md, { plugins: [footnotes({ hr: false })] })

    const section = tree.nodes.find((n) => Array.isArray(n) && n[0] === 'section') as any[]

    const hrNode = section.find((n: any, i: number) => i >= 2 && Array.isArray(n) && n[0] === 'hr')
    expect(hrNode).toBeFalsy()
  })

  it('should not create footnotes section when no references exist', async () => {
    const md = `Hello world with no footnotes`

    const tree = await parse(md, { plugins: [footnotes()] })

    const section = tree.nodes.find((n) => Array.isArray(n) && n[0] === 'section')
    expect(section).toBeFalsy()
  })

  it('should handle footnotes inside inline elements', async () => {
    const md = `**Bold text[^1]** and more

[^1]: Note`

    const tree = await parse(md, { plugins: [footnotes()] })

    // Should still find the footnotes section
    const section = tree.nodes.find((n) => Array.isArray(n) && n[0] === 'section')
    expect(section).toBeTruthy()
  })

  it('should ignore references with no matching definition', async () => {
    const md = `Text[^undefined]`

    const tree = await parse(md, { plugins: [footnotes()] })

    // No footnotes section should be created
    const section = tree.nodes.find((n) => Array.isArray(n) && n[0] === 'section')
    expect(section).toBeFalsy()
  })

  it('should use custom label for footnotes section', async () => {
    const md = `Text[^1]

[^1]: Note`

    const tree = await parse(md, { plugins: [footnotes({ label: 'References' })] })

    const section = tree.nodes.find((n) => Array.isArray(n) && n[0] === 'section') as any[]

    const h2 = section.find((n: any, i: number) => i >= 2 && Array.isArray(n) && n[0] === 'h2')
    expect(h2).toBeTruthy()
    expect(h2[2]).toBe('References')
  })

  it('should number footnotes in order of first reference', async () => {
    const md = `Second ref[^b], first ref[^a]

[^a]: Alpha note
[^b]: Beta note`

    const tree = await parse(md, { plugins: [footnotes()] })

    function findNode(nodes: any[], predicate: (n: any) => boolean): any {
      for (const node of nodes) {
        if (predicate(node)) return node
        if (Array.isArray(node)) {
          const found = findNode(node.slice(2), predicate)
          if (found) return found
        }
      }
      return null
    }

    // First reference encountered should be [^b] → [1]
    const firstRef = findNode(
      tree.nodes,
      (n: any) => Array.isArray(n) && n[0] === 'a' && (n[1] as any)?.id === 'fnref-b'
    )
    expect(firstRef).toBeTruthy()
    expect(firstRef[2]).toBe('[1]')

    // Second reference encountered should be [^a] → [2]
    const secondRef = findNode(
      tree.nodes,
      (n: any) => Array.isArray(n) && n[0] === 'a' && (n[1] as any)?.id === 'fnref-a'
    )
    expect(secondRef).toBeTruthy()
    expect(secondRef[2]).toBe('[2]')
  })
})

describe('footnotes stringify', () => {
  it('should render footnotes back to markdown syntax', async () => {
    const md = `Hello world[^1]

[^1]: This is a footnote`

    const tree = await parse(md, { plugins: [footnotes()] })
    const result = await renderMarkdown(tree, {
      components: { footnotes: Footnote },
    })

    expect(result).toContain('[^1]')
    expect(result).toContain('[^1]: This is a footnote')
  })

  it('should render multiple footnotes back to markdown', async () => {
    const md = `First[^1] and second[^2]

[^1]: First note
[^2]: Second note`

    const tree = await parse(md, { plugins: [footnotes()] })
    const result = await renderMarkdown(tree, {
      components: { footnotes: Footnote },
    })

    expect(result).toContain('[^1]')
    expect(result).toContain('[^2]')
    expect(result).toContain('[^1]: First note')
    expect(result).toContain('[^2]: Second note')
  })

  it('should render named footnote keys', async () => {
    const md = `Text[^note]

[^note]: A note`

    const tree = await parse(md, { plugins: [footnotes()] })
    const result = await renderMarkdown(tree, {
      components: { footnotes: Footnote },
    })

    expect(result).toContain('[^note]')
    expect(result).toContain('[^note]: A note')
  })
})
