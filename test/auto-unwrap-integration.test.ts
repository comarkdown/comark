import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'
import type { MinimarkNode } from 'minimark'

// Helper to check if a node is an element with a specific tag
function isElement(node: MinimarkNode, tag: string): boolean {
  return Array.isArray(node) && node[0] === tag
}

// Helper to get children of an element (elements after tag and props)
function getChildren(node: MinimarkNode): MinimarkNode[] {
  if (Array.isArray(node) && node.length > 2) {
    return node.slice(2) as MinimarkNode[]
  }
  return []
}

describe('auto-unwrap integration', () => {
  it('should automatically unwrap single paragraph by default', () => {
    const content = `::alert
This is **bold** text
::`

    const result = parse(content)
    const alert = result.body.value[0] as MinimarkNode

    expect(alert[0]).toBe('alert')

    // Paragraph should be unwrapped - content should be direct children
    const children = getChildren(alert)
    expect(children.length).toBeGreaterThan(0)
    // Should have text and strong elements as direct children (no wrapping p)
    const hasDirectText = children.some(child => typeof child === 'string')
    const hasDirectStrong = children.some(child => isElement(child, 'strong'))
    expect(hasDirectText).toBe(true)
    expect(hasDirectStrong).toBe(true)
  })

  it('should not unwrap when autoUnwrap is false', () => {
    const content = `::alert
This is **bold** text
::`

    const result = parse(content, { autoUnwrap: false })
    const alert = result.body.value[0] as MinimarkNode

    expect(alert[0]).toBe('alert')

    // Paragraph should remain
    const children = getChildren(alert)
    expect(children).toHaveLength(1)
    expect(isElement(children[0], 'p')).toBe(true)
  })

  it('should not unwrap when there are multiple paragraphs', () => {
    const content = `::card
First paragraph

Second paragraph
::`

    const result = parse(content)
    const card = result.body.value[0] as MinimarkNode

    expect(card[0]).toBe('card')

    // Should have two paragraphs (not unwrapped)
    const children = getChildren(card)
    const paragraphs = children.filter(child => isElement(child, 'p'))
    expect(paragraphs).toHaveLength(2)
  })

  it('should not unwrap when paragraph is mixed with lists', () => {
    const content = `::warning
**Alert!**

- Item 1
- Item 2
::`

    const result = parse(content)
    const warning = result.body.value[0] as MinimarkNode

    expect(warning[0]).toBe('warning')

    // Should have both paragraph and list (not unwrapped)
    const children = getChildren(warning)
    const hasParagraph = children.some(child => isElement(child, 'p'))
    const hasList = children.some(child => isElement(child, 'ul'))

    expect(hasParagraph).toBe(true)
    expect(hasList).toBe(true)
  })

  it('should not unwrap when there are code blocks', () => {
    const content = `::tip
\`\`\`js
console.log('hello')
\`\`\`
::`

    const result = parse(content)
    const tip = result.body.value[0] as MinimarkNode

    expect(tip[0]).toBe('tip')

    // Code block (pre) should be preserved, not unwrapped
    const children = getChildren(tip)
    const hasPreElement = children.some(child => isElement(child, 'pre'))
    expect(hasPreElement).toBe(true)
  })

  it('should not unwrap when there are tables', () => {
    const content = `::info
| Name | Age |
|------|-----|
| John | 30  |
::`

    const result = parse(content)
    const info = result.body.value[0] as MinimarkNode

    expect(info[0]).toBe('info')

    // Table should be preserved, not unwrapped
    const children = getChildren(info)
    const hasTable = children.some(child => isElement(child, 'table'))
    expect(hasTable).toBe(true)
  })

  it('should apply to all recognized container types', () => {
    const containerTypes = ['alert', 'card', 'callout', 'note', 'warning', 'tip', 'info']

    for (const type of containerTypes) {
      const content = `::${type}
**Content**
::`

      const resultWith = parse(content)
      const containerWith = resultWith.body.value[0] as MinimarkNode

      expect(containerWith[0]).toBe(type)

      // Should have unwrapped (no paragraph wrapper)
      const childrenWith = getChildren(containerWith)
      const hasDirectStrong = childrenWith.some(child => isElement(child, 'strong'))
      expect(hasDirectStrong).toBe(true)

      // Compare with disabled
      const resultWithout = parse(content, { autoUnwrap: false })
      const containerWithout = resultWithout.body.value[0] as MinimarkNode

      // Should have paragraph wrapper when disabled
      const childrenWithout = getChildren(containerWithout)
      const hasParagraph = childrenWithout.some(child => isElement(child, 'p'))
      expect(hasParagraph).toBe(true)
    }
  })
})
