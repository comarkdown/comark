import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index'
import type { Node } from 'comark'

function isElement(node: Node, tag: string): boolean {
  return Array.isArray(node) && node[0] === tag
}

function getChildren(node: Node): Node[] {
  if (Array.isArray(node) && node.length > 2) {
    return node.slice(2) as Node[]
  }
  return []
}

describe('auto-unwrap integration', () => {
  it('should automatically unwrap single paragraph by default', async () => {
    const content = `::alert
This is **bold** text
::`

    const result = await parseMarkdown(content)
    const alert = result.nodes[0] as Node

    expect(alert[0]).toBe('alert')

    const children = getChildren(alert)
    expect(children.length).toBeGreaterThan(0)
    const hasDirectText = children.some((child) => typeof child === 'string')
    const hasDirectStrong = children.some((child) => isElement(child, 'strong'))
    expect(hasDirectText).toBe(true)
    expect(hasDirectStrong).toBe(true)
  })

  it('should not unwrap when autoUnwrap is false', async () => {
    const content = `::alert
This is **bold** text
::`

    const result = await parseMarkdown(content, { autoUnwrap: false })
    const alert = result.nodes[0] as Node

    expect(alert[0]).toBe('alert')

    const children = getChildren(alert)
    expect(children).toHaveLength(1)
    expect(isElement(children[0], 'p')).toBe(true)
  })

  it('should not unwrap when there are multiple paragraphs', async () => {
    const content = `::card
First paragraph

Second paragraph
::`

    const result = await parseMarkdown(content)
    const card = result.nodes[0] as Node

    expect(card[0]).toBe('card')

    const children = getChildren(card)
    const paragraphs = children.filter((child) => isElement(child, 'p'))
    expect(paragraphs).toHaveLength(2)
  })

  it('should not unwrap when paragraph is mixed with lists', async () => {
    const content = `::warning
**Alert!**

- Item 1
- Item 2
::`

    const result = await parseMarkdown(content)
    const warning = result.nodes[0] as Node

    expect(warning[0]).toBe('warning')

    const children = getChildren(warning)
    const hasParagraph = children.some((child) => isElement(child, 'p'))
    const hasList = children.some((child) => isElement(child, 'ul'))

    expect(hasParagraph).toBe(true)
    expect(hasList).toBe(true)
  })

  it('should not unwrap when there are code blocks', async () => {
    const content = `::tip
\`\`\`js
console.log('hello')
\`\`\`
::`

    const result = await parseMarkdown(content)
    const tip = result.nodes[0] as Node

    expect(tip[0]).toBe('tip')

    const children = getChildren(tip)
    const hasPreElement = children.some((child) => isElement(child, 'pre'))
    expect(hasPreElement).toBe(true)
  })

  it('should not unwrap when there are tables', async () => {
    const content = `::info
| Name | Age |
|------|-----|
| John | 30  |
::`

    const result = await parseMarkdown(content)
    const info = result.nodes[0] as Node

    expect(info[0]).toBe('info')

    const children = getChildren(info)
    const hasTable = children.some((child) => isElement(child, 'table'))
    expect(hasTable).toBe(true)
  })

  it('should apply to all recognized container types', async () => {
    const containerTypes = ['alert', 'card', 'callout', 'note', 'warning', 'tip', 'info']

    for (const type of containerTypes) {
      const content = `::${type}
**Content**
::`

      const resultWith = await parseMarkdown(content)
      const containerWith = resultWith.nodes[0] as Node

      expect(containerWith[0]).toBe(type)

      const childrenWith = getChildren(containerWith)
      const hasDirectStrong = childrenWith.some((child) => isElement(child, 'strong'))
      expect(hasDirectStrong).toBe(true)

      const resultWithout = await parseMarkdown(content, { autoUnwrap: false })
      const containerWithout = resultWithout.nodes[0] as Node

      const childrenWithout = getChildren(containerWithout)
      const hasParagraph = childrenWithout.some((child) => isElement(child, 'p'))
      expect(hasParagraph).toBe(true)
    }
  })
})
