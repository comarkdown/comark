import { describe, expect, it } from 'vitest'
import { createMarkdownParser, defineComarkPlugin } from 'comark'
import type { MarkdownItPlugin } from 'comark'

// The shared instance is internal, so it is observed through the public API: a
// markdown-it plugin function runs once per instance, so counting how often it
// is registered counts the instances that were built.
let stableUses = 0
const stableMdPlugin = (() => {
  stableUses++
}) as unknown as MarkdownItPlugin

const stablePlugin = defineComarkPlugin(() => ({
  name: 'sharing-stable',
  markdownItPlugins: [stableMdPlugin],
}))

let closureUses = 0
const closurePlugin = defineComarkPlugin(() => ({
  name: 'sharing-closure',
  markdownItPlugins: [
    (() => {
      closureUses++
    }) as unknown as MarkdownItPlugin,
  ],
}))

describe('parser sharing', () => {
  it('builds one instance for parsers with the same plugin functions', () => {
    const plugin = stablePlugin()
    const before = stableUses

    for (let i = 0; i < 20; i++) {
      createMarkdownParser({ plugins: [plugin] })
    }

    expect(stableUses - before).toBe(1)
  })

  it('builds one instance per closure when a factory returns a fresh function', () => {
    const before = closureUses

    for (let i = 0; i < 5; i++) {
      createMarkdownParser({ plugins: [closurePlugin()] })
    }

    expect(closureUses - before).toBe(5)
  })

  it('does not share an instance between linkify settings', async () => {
    const withLinkify = await createMarkdownParser({ linkify: true })('See https://comark.dev for more')
    const withoutLinkify = await createMarkdownParser({ linkify: false })('See https://comark.dev for more')

    expect(JSON.stringify(withLinkify.nodes)).toContain('"a"')
    expect(JSON.stringify(withoutLinkify.nodes)).not.toContain('"a"')
  })

  it('keeps streaming state on the parser across another parser use', async () => {
    const streaming = createMarkdownParser()
    const other = createMarkdownParser()

    await streaming('# Title\n\nFirst paragraph.\n', { streaming: true })
    const second = await streaming('# Title\n\nFirst paragraph.\n\nSecond paragraph.\n', { streaming: true })

    await other('Unrelated **document**')

    const third = await streaming('# Title\n\nFirst paragraph.\n\nSecond paragraph.\n\nThird paragraph.\n', {
      streaming: true,
    })

    // Reused nodes are carried over by reference from the previous output.
    expect(third.nodes[0]).toBe(second.nodes[0])
    expect(third.nodes[1]).toBe(second.nodes[1])
    expect(third.nodes).toHaveLength(4)
  })
})
