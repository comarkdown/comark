import { Readable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'
import { parseStreamIncremental } from '../src/stream'

describe('streaming with Error Tolerance', () => {
  it('should handle component errors during incomplete streaming gracefully', async () => {
    // Markdown with component that has YAML props
    const markdown = `::required-prop-test
---
name: John Doe
---
::`

    // Simulate streaming in very small chunks
    const chunkSize = 5
    const chunks: string[] = []
    for (let i = 0; i < markdown.length; i += chunkSize) {
      chunks.push(markdown.slice(i, i + chunkSize))
    }

    // console.log(`\nStreaming ${chunks.length} chunks of size ${chunkSize}`)

    const stream = Readable.from(chunks)
    const results = []

    // Track warnings (our error handler logs warnings)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      for await (const result of parseStreamIncremental(stream)) {
        results.push(result)

        // Check if we have a component
        const hasComponent = result.body.children.some((c: any) => c.tag === 'required-prop-test')

        if (hasComponent) {
          const component = result.body.children.find((c: any) => c.tag === 'required-prop-test')
          // console.log(`Chunk ${results.length}: component found with props:`, component.props)

          // Early chunks might not have the props yet, causing errors
          // Our error handler should catch these gracefully
          const hasNameProp = component.props && 'name' in component.props

          if (!hasNameProp) {
            // console.log('  → Component missing required prop (expected during early streaming)')
          }
        }
      }

      // console.log(`Total results: ${results.length}`)

      // Final result should have complete props
      const final = results[results.length - 1]
      expect(final.isComplete).toBe(true)

      const finalComponent = final.body.children.find((c: any) => c.tag === 'required-prop-test')
      expect(finalComponent).toBeDefined()
      expect(finalComponent.props).toHaveProperty('name', 'John Doe')

      // console.log('Final component props:', finalComponent.props)
      // console.log('Warnings logged:', warnSpy.mock.calls.length)
    }
    finally {
      warnSpy.mockRestore()
    }
  })

  it('should recover and render correctly once props become available', async () => {
    const markdown = `# Title

::required-prop-test
---
name: Alice
---
::

## More content`

    const chunkSize = 10
    const chunks: string[] = []
    for (let i = 0; i < markdown.length; i += chunkSize) {
      chunks.push(markdown.slice(i, i + chunkSize))
    }

    const stream = Readable.from(chunks)
    const results = []

    for await (const result of parseStreamIncremental(stream)) {
      results.push(result)
    }

    // Final result should have complete structure
    const final = results[results.length - 1]
    expect(final.isComplete).toBe(true)

    // Check we have all content
    const hasH1 = final.body.children.some((c: any) => c.tag === 'h1')
    const hasComponent = final.body.children.some((c: any) => c.tag === 'required-prop-test')
    const hasH2 = final.body.children.some((c: any) => c.tag === 'h2')

    expect(hasH1).toBe(true)
    expect(hasComponent).toBe(true)
    expect(hasH2).toBe(true)

    // Component should have correct props
    const component = final.body.children.find((c: any) => c.tag === 'required-prop-test')
    expect(component.props).toHaveProperty('name', 'Alice')
  })
})
