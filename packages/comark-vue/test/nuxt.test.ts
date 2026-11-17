import { describe, expect, it, vi } from 'vitest'
import { Markdown, MarkdownDocument } from '@comark/vue'

const components = vi.hoisted(() => [] as Array<{ name: string; export: string; filePath: string }>)

vi.mock('@nuxt/kit', () => ({
  defineNuxtModule: (definition: unknown) => definition,
  addComponent: (component: (typeof components)[number]) => components.push(component),
  addImports: () => {},
  addServerImports: () => {},
  addVitePlugin: () => {},
}))

describe('@comark/vue nuxt module', () => {
  it('registers each component from its own entry, so <MarkdownDocument> does not load the parser', async () => {
    const { default: module } = (await import('../src/nuxt.ts')) as any
    module.setup({}, { hook: () => {}, options: {} })

    expect(components.map((c) => [c.name, c.filePath])).toEqual([
      ['Markdown', '@comark/vue/components/Markdown'],
      ['MarkdownDocument', '@comark/vue/components/MarkdownDocument'],
    ])

    // Each entry exports the same component as the package index.
    const fromIndex: Record<string, unknown> = { Markdown, MarkdownDocument }
    for (const component of components) {
      const entry = await import(component.filePath)
      expect(entry[component.export]).toBe(fromIndex[component.name])
    }
  })
})
