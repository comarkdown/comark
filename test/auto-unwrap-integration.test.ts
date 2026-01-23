import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'
import type { MDCElement } from '../src/types/tree'

describe('auto-unwrap integration', () => {
  it('should automatically unwrap single paragraph by default', () => {
    const content = `::alert
This is **bold** text
::`

    const result = parse(content)
    const alert = result.body.children[0] as MDCElement

    expect(alert).toMatchObject({
      type: 'element',
      tag: 'alert',
    })

    // Paragraph should be unwrapped - content should be direct children
    expect(alert.children.length).toBeGreaterThan(0)
    // Should have text and strong elements as direct children (no wrapping p)
    const hasDirectText = alert.children.some(child => child.type === 'text')
    const hasDirectStrong = alert.children.some(
      child => child.type === 'element' && child.tag === 'strong',
    )
    expect(hasDirectText).toBe(true)
    expect(hasDirectStrong).toBe(true)
  })

  it('should not unwrap when autoUnwrap is false', () => {
    const content = `::alert
This is **bold** text
::`

    const result = parse(content, { autoUnwrap: false })
    const alert = result.body.children[0] as MDCElement

    expect(alert).toMatchObject({
      type: 'element',
      tag: 'alert',
    })

    // Paragraph should remain
    expect(alert.children).toHaveLength(1)
    expect(alert.children[0]).toMatchObject({
      type: 'element',
      tag: 'p',
    })
  })

  it('should not unwrap when there are multiple paragraphs', () => {
    const content = `::card
First paragraph

Second paragraph
::`

    const result = parse(content)
    const card = result.body.children[0] as MDCElement

    expect(card).toMatchObject({
      type: 'element',
      tag: 'card',
    })

    // Should have two paragraphs (not unwrapped)
    const paragraphs = card.children.filter(
      child => child.type === 'element' && child.tag === 'p',
    )
    expect(paragraphs).toHaveLength(2)
  })

  it('should not unwrap when paragraph is mixed with lists', () => {
    const content = `::warning
**Alert!**

- Item 1
- Item 2
::`

    const result = parse(content)
    const warning = result.body.children[0] as MDCElement

    expect(warning).toMatchObject({
      type: 'element',
      tag: 'warning',
    })

    // Should have both paragraph and list (not unwrapped)
    const hasParagraph = warning.children.some(
      child => child.type === 'element' && child.tag === 'p',
    )
    const hasList = warning.children.some(
      child => child.type === 'element' && child.tag === 'ul',
    )

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
    const tip = result.body.children[0] as MDCElement

    expect(tip).toMatchObject({
      type: 'element',
      tag: 'tip',
    })

    // Code block (pre) should be preserved, not unwrapped
    const hasPreElement = tip.children.some(
      child => child.type === 'element' && child.tag === 'pre',
    )
    expect(hasPreElement).toBe(true)
  })

  it('should not unwrap when there are tables', () => {
    const content = `::info
| Name | Age |
|------|-----|
| John | 30  |
::`

    const result = parse(content)
    const info = result.body.children[0] as MDCElement

    expect(info).toMatchObject({
      type: 'element',
      tag: 'info',
    })

    // Table should be preserved, not unwrapped
    const hasTable = info.children.some(
      child => child.type === 'element' && child.tag === 'table',
    )
    expect(hasTable).toBe(true)
  })

  it('should apply to all recognized container types', () => {
    const containerTypes = ['alert', 'card', 'callout', 'note', 'warning', 'tip', 'info']

    for (const type of containerTypes) {
      const content = `::${type}
**Content**
::`

      const resultWith = parse(content)
      const containerWith = resultWith.body.children[0] as MDCElement

      expect(containerWith.tag).toBe(type)

      // Should have unwrapped (no paragraph wrapper)
      const hasDirectStrong = containerWith.children.some(
        child => child.type === 'element' && child.tag === 'strong',
      )
      expect(hasDirectStrong).toBe(true)

      // Compare with disabled
      const resultWithout = parse(content, { autoUnwrap: false })
      const containerWithout = resultWithout.body.children[0] as MDCElement

      // Should have paragraph wrapper when disabled
      const hasParagraph = containerWithout.children.some(
        child => child.type === 'element' && child.tag === 'p',
      )
      expect(hasParagraph).toBe(true)
    }
  })
})
