import { describe, expect, it } from 'vitest'
import { parse, createParse } from 'comark'

describe('@comark/angular — integration', () => {
  it('parses markdown into a tree compatible with the renderer', async () => {
    const tree = await parse('# Hello **World**')
    expect(tree.nodes).toBeDefined()
    expect(tree.nodes.length).toBeGreaterThan(0)

    // First node should be an h1
    const h1 = tree.nodes[0] as any[]
    expect(h1[0]).toBe('h1')
  })

  it('parses component syntax', async () => {
    const tree = await parse(`::alert{type="info"}\nThis is an alert\n::`)
    expect(tree.nodes.length).toBeGreaterThan(0)

    const alert = tree.nodes[0] as any[]
    expect(alert[0]).toBe('alert')
    expect(alert[1]).toHaveProperty('type', 'info')
  })

  it('parses frontmatter', async () => {
    const tree = await parse(`---\ntitle: Hello\n---\n\n# Content`)
    expect(tree.frontmatter).toHaveProperty('title', 'Hello')
  })

  it('handles streaming with caret', async () => {
    const comarkStreaming = createParse()
    const tree = await comarkStreaming('Hello **wor', { streaming: true })
    expect(tree.nodes).toBeDefined()
  })
})
