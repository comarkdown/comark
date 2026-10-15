import { describe, expect, it } from 'vitest'
import { createMarkdownParser, defineComarkPlugin } from 'comark'
import type { MarkdownItPlugin } from 'comark'
import binding from '../src/plugins/binding'

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

  it('refreshes cache hits and evicts the least-recently-used shared instance once the cache is full', () => {
    // Dedicated plugins so prior tests in this file cannot keep these keys warm.
    let markedUses = 0
    const markedMdPlugin = (() => {
      markedUses++
    }) as unknown as MarkdownItPlugin
    const markedPlugin = defineComarkPlugin(() => ({
      name: 'sharing-evict-mark',
      markdownItPlugins: [markedMdPlugin],
    }))()

    let oldestUses = 0
    const oldestMdPlugin = (() => {
      oldestUses++
    }) as unknown as MarkdownItPlugin
    const oldestPlugin = defineComarkPlugin(() => ({
      name: 'sharing-evict-oldest',
      markdownItPlugins: [oldestMdPlugin],
    }))()

    createMarkdownParser({ plugins: [markedPlugin] })
    createMarkdownParser({ plugins: [oldestPlugin] })

    // Capacity is 32. Keep both named entries in the cache, then refresh
    // markedPlugin before inserting one more key so only oldestPlugin ages out.
    for (let i = 0; i < 30; i++) {
      createMarkdownParser({ plugins: [closurePlugin()] })
    }

    expect(markedUses).toBe(1)
    expect(oldestUses).toBe(1)

    createMarkdownParser({ plugins: [markedPlugin] })
    createMarkdownParser({ plugins: [closurePlugin()] })

    createMarkdownParser({ plugins: [oldestPlugin] })
    expect(oldestUses).toBe(2)
    createMarkdownParser({ plugins: [markedPlugin] })
    expect(markedUses).toBe(1)
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

  it('respects distinct plugin options and does not mix them through a shared instance', async () => {
    // binding() closes `tag` into a fresh markdown-it plugin per factory call, so
    // each options object must get its own MarkdownExit. Interleave parses so a
    // shared-by-mistake instance would leak the later registration into earlier ones.
    const parseDefault = createMarkdownParser({ plugins: [binding()] })
    const parseCustom = createMarkdownParser({ plugins: [binding({ tag: 'var' })] })
    const parseOtherCustom = createMarkdownParser({ plugins: [binding({ tag: 'slot' })] })

    const source = 'Hello {{ name }}'

    const defaultFirst = await parseDefault(source)
    const custom = await parseCustom(source)
    const otherCustom = await parseOtherCustom(source)
    const defaultAgain = await parseDefault(source)

    expect(JSON.stringify(defaultFirst.nodes)).toContain('"binding"')
    expect(JSON.stringify(defaultFirst.nodes)).not.toContain('"var"')
    expect(JSON.stringify(defaultFirst.nodes)).not.toContain('"slot"')

    expect(JSON.stringify(custom.nodes)).toContain('"var"')
    expect(JSON.stringify(custom.nodes)).not.toContain('"binding"')
    expect(JSON.stringify(custom.nodes)).not.toContain('"slot"')

    expect(JSON.stringify(otherCustom.nodes)).toContain('"slot"')
    expect(JSON.stringify(otherCustom.nodes)).not.toContain('"binding"')
    expect(JSON.stringify(otherCustom.nodes)).not.toContain('"var"')

    // First parser still carries its original options after the others ran.
    expect(defaultAgain.nodes).toEqual(defaultFirst.nodes)
  })
})
