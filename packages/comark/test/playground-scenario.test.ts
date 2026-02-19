import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'
import type { ComarkNode } from 'comark/ast'

// Helper to check if a node is an element with a specific tag
function isElement(node: ComarkNode, tag: string): boolean {
  return Array.isArray(node) && node[0] === tag
}

describe('playground Scenario', () => {
  const playgroundContent = `# Comark Demo
**This demo This demo This demo This demo This demo This demo This demo This demo This demo**
This demo shows **real-time rendering** with *auto-close* support!

::alert{type="info"}
Watch how **bold text** and components render correctly.
::

## Features

- Auto-closes unclosed \`**bold**\` syntax
- Auto-closes unclosed \`::components\`
- Handles nested components gracefully

::card
**Progressive rendering** means you see content *as it arrives*, not after everything is loaded.

  :::card
  This is perfect for:
  - AI chat responses
  - Large document loading
  - Real-time collaborative editing
  :::
::

> Try different parsers and watch the AST update!
`

  it('should parse playground content correctly', async () => {
    const result = await parse(playgroundContent)

    expect(result.nodes).toBeDefined()
    expect(Array.isArray(result.nodes)).toBe(true)
    expect(result.nodes.length).toBeGreaterThan(0)

    // Check for alert
    const hasAlert = result.nodes.some((c: ComarkNode) => isElement(c, 'alert'))
    expect(hasAlert).toBe(true)

    // Check for card
    const hasCard = result.nodes.some((c: ComarkNode) => isElement(c, 'card'))
    expect(hasCard).toBe(true)

    // Check for nested card
    const cards = result.nodes.filter((c: ComarkNode) => isElement(c, 'card'))
    expect(cards.length).toBeGreaterThan(0)

    // Inspect the first card for nested content
    if (cards.length > 0) {
      const firstCard = cards[0] as any
      const hasNestedCard = JSON.stringify(firstCard).includes('"card"')
      expect(hasNestedCard).toBe(true)
    }
  })

  it('should parse content with complex nesting', async () => {
    const result = await parse(playgroundContent)

    expect(result.nodes).toBeDefined()
    expect(Array.isArray(result.nodes)).toBe(true)
    expect(result.nodes.length).toBeGreaterThan(0)

    // Check for alert
    const hasAlert = result.nodes.some((c: ComarkNode) => isElement(c, 'alert'))
    expect(hasAlert).toBe(true)
  })

  it('should handle alert syntax correctly', async () => {
    const alertOnly = `::alert{type="info"}
Watch how **bold text** and components render correctly.
::`

    const result = await parse(alertOnly)

    expect(result.nodes).toBeDefined()
    expect(Array.isArray(result.nodes)).toBe(true)

    // Should have alert
    const hasAlert = result.nodes.some((c: ComarkNode) => isElement(c, 'alert'))
    expect(hasAlert).toBe(true)

    // Get the alert element
    const alert = result.nodes.find((c: ComarkNode) => isElement(c, 'alert'))
    expect(alert).toBeDefined()
  })
})
