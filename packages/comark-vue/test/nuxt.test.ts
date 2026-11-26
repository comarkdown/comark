import { describe, expect, it, vi } from 'vitest'
import * as index from '@comark/vue'

const fromIndex: Record<string, unknown> = { ...index }

const components = vi.hoisted(() => [] as Array<{ name: string; export: string; filePath: string }>)
const imports = vi.hoisted(() => [] as Array<{ name: string; from: string }>)

vi.mock('@nuxt/kit', () => ({
  defineNuxtModule: (definition: unknown) => definition,
  addComponent: (component: (typeof components)[number]) => components.push(component),
  addImports: (entries: typeof imports) => imports.push(...entries),
  addServerImports: () => {},
  addVitePlugin: () => {},
}))

describe('@comark/vue nuxt module', async () => {
  const { default: module } = (await import('../src/nuxt.ts')) as any
  module.setup({}, { hook: () => {}, options: {} })

  it('registers each component from its own entry, so <MarkdownDocument> does not load the parser', async () => {
    expect(components.map((c) => [c.name, c.filePath])).toEqual([
      ['Markdown', '@comark/vue/components/Markdown'],
      ['MarkdownDocument', '@comark/vue/components/MarkdownDocument'],
    ])

    // Each entry exports the same component as the package index.
    for (const component of components) {
      const entry = await import(component.filePath)
      expect(entry[component.export]).toBe(fromIndex[component.name])
    }
  })

  it('auto-imports defineMarkdownDocumentComponent from the <MarkdownDocument> entry, so it does not load the parser', async () => {
    const defineImports = imports.filter((i) => i.name.startsWith('define'))
    expect(defineImports.map((i) => [i.name, i.from])).toEqual([
      ['defineMarkdownComponent', '@comark/vue'],
      ['defineMarkdownDocumentComponent', '@comark/vue/components/MarkdownDocument'],
    ])

    for (const { name, from } of defineImports) {
      const entry = await import(from)
      expect(entry[name]).toBe(fromIndex[name])
    }
  })
})
