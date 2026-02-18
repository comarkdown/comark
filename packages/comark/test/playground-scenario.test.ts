import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { parseStreamIncremental } from '../src/stream'
import type { ComarkNode } from 'comark/ast'

// Helper to check if a node is an element with a specific tag
function isElement(node: ComarkNode, tag: string): boolean {
  return Array.isArray(node) && node[0] === tag
}

describe('playground Scenario', () => {
  const playgroundContent = `# Comark Streaming Demo
**This demo This demo This demo This demo This demo This demo This demo This demo This demo**
This demo shows **real-time rendering** with *auto-close* support!

::alert{type="info"}
Watch how **bold text** and components render correctly even when syntax arrives in chunks.
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

> Try different parsers and watch the AST update in real-time!
`

  it('should parse playground content with markdown-it in small chunks', async () => {
    const chunkSize = 10
    const chunks: string[] = []

    for (let i = 0; i < playgroundContent.length; i += chunkSize) {
      chunks.push(playgroundContent.slice(i, i + chunkSize))
    }

    // console.log(`Testing with ${chunks.length} chunks of size ${chunkSize}`)

    const stream = Readable.from(chunks)
    const results = []
    let _errorCount = 0

    for await (const result of parseStreamIncremental(stream)) {
      try {
        expect(result.body.type).toBe('comark')
        results.push(result)

        // Log intermediate states
        if (!result.isComplete && results.length % 10 === 0) {
          // console.log(`Chunk ${results.length}: ${result.body.value.length} children`)
        }
      }
      catch (err) {
        _errorCount++
        console.error(`Error at chunk ${results.length}:`, err)
      }
    }

    // console.log(`Total results: ${results.length}`)
    // console.log(`Errors: ${errorCount}`)

    // Final result
    const final = results[results.length - 1]
    expect(final.isComplete).toBe(true)
    expect(final.body.value.length).toBeGreaterThan(0)

    // Check for alert
    const _hasAlert = final.body.value.some((c: ComarkNode) => isElement(c, 'alert'))
    // console.log('Has alert component:', _hasAlert)
    expect(_hasAlert).toBe(true)

    // Check for card
    const hasCard = final.body.value.some((c: ComarkNode) => isElement(c, 'card'))
    // console.log('Has card component:', hasCard)
    expect(hasCard).toBe(true)

    // Check for nested card
    const cards = final.body.value.filter((c: ComarkNode) => isElement(c, 'card'))
    // console.log('Number of card components:', cards.length)

    // Inspect the first card for nested content
    if (cards.length > 0) {
      const firstCard = cards[0] as any
      // console.log('First card has children:', firstCard.length - 2 || 0)

      const _hasNestedCard = JSON.stringify(firstCard).includes('"card"')
      // console.log('Has nested card:', hasNestedCard)
    }
  })

  it('should parse playground content with remark in small chunks', async () => {
    const chunkSize = 10
    const chunks: string[] = []

    for (let i = 0; i < playgroundContent.length; i += chunkSize) {
      chunks.push(playgroundContent.slice(i, i + chunkSize))
    }

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      expect(result.body.type).toBe('comark')
      results.push(result)
    }

    // Final result
    const final = results[results.length - 1]
    expect(final.isComplete).toBe(true)
    expect(final.body.value.length).toBeGreaterThan(0)

    // Check for alert
    const _hasAlert = final.body.value.some((c: ComarkNode) => isElement(c, 'alert'))
    // console.log('Remark - Has alert component:', hasAlert)
  })

  it('should handle the exact alert syntax from playground', async () => {
    const alertOnly = `::alert{type="info"}
Watch how **bold text** and components render correctly even when syntax arrives in chunks.
::`

    // Test with very small chunks (character by character almost)
    const chunks: string[] = []
    for (let i = 0; i < alertOnly.length; i += 5) {
      chunks.push(alertOnly.slice(i, i + 5))
    }

    // console.log(`Testing alert with ${chunks.length} tiny chunks`)

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    // console.log(`Total results: ${results.length}`)

    // Check each intermediate result
    let alertAppeared = -1
    results.forEach((result, i) => {
      const _hasAlert = result.body.value.some((c: ComarkNode) => isElement(c, 'alert'))
      if (_hasAlert && alertAppeared === -1) {
        alertAppeared = i
      }
    })

    // console.log(`Alert appeared at result ${alertAppeared + 1}/${results.length}`)

    // Final should definitely have alert
    const final = results[results.length - 1]
    const _hasAlert = final.body.value.some((c: ComarkNode) => isElement(c, 'alert'))
    expect(_hasAlert).toBe(true)

    // Get the alert element
    const _alert = final.body.value.find((c: ComarkNode) => isElement(c, 'alert'))
    // console.log('Alert element:', JSON.stringify(alert, null, 2))
  })
})
