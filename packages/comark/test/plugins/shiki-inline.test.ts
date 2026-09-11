import { afterEach, describe, expect, it } from 'vitest'
import javascript from 'shiki/dist/langs/javascript.mjs'
import vueHtml from 'shiki/dist/langs/vue-html.mjs'
import githubDark from 'shiki/dist/themes/github-dark.mjs'
import { parseMarkdown } from '../../src/index'
import type { ComarkPlugin, ElementNode, Node } from '../../src/types'
import shiki from '../../src/plugins/shiki'
import shikiCore, { resetHighlighter } from '../../src/plugins/shiki/core'
import type { ShikiOptions } from '../../src/plugins/shiki'

afterEach(resetHighlighter)

async function inlineCode(source: string, options: ShikiOptions = {}): Promise<ElementNode> {
  const document = await parseMarkdown(source, { plugins: [shiki(options)] })
  return (document.nodes[0] as ElementNode)[2] as ElementNode
}

/** Collect every `style` on the node's span children, in order. */
function styles(node: ElementNode): string[] {
  return (node.slice(2) as Node[])
    .filter((child): child is ElementNode => Array.isArray(child))
    .map((child) => String((child[1] as Record<string, unknown>).style ?? ''))
}

describe('shiki inline code', () => {
  it('highlights inline code carrying a lang attribute', async () => {
    const code = await inlineCode('`const a = 1`{lang="ts"}')

    expect(code[0]).toBe('code')
    expect(String((code[1] as Record<string, unknown>).class)).toMatch(/^shiki /)
    expect(code.length).toBeGreaterThan(3)
    expect(styles(code).some(Boolean)).toBe(true)
  })

  it('accepts `language` as well as `lang`', async () => {
    const code = await inlineCode('`const a = 1`{language="ts"}')
    expect(String((code[1] as Record<string, unknown>).class)).toMatch(/^shiki /)
  })

  it('prefers `lang` when both are present', async () => {
    const both = await inlineCode('`Ref<T>`{lang="ts-type" language="ts"}')
    const asType = await inlineCode('`Ref<T>`{lang="ts-type"}')
    expect(styles(both)).toEqual(styles(asType))
  })

  describe('built-in grammar contexts', () => {
    it('tokenizes ts-type as a type expression, not a plain statement', async () => {
      const asType = await inlineCode('`Ref<T>`{lang="ts-type"}', { themes: { dark: githubDark } })
      const asStatement = await inlineCode('`Ref<T>`{lang="ts"}', { themes: { dark: githubDark } })

      // Without the `let a:` seed, `Ref` falls through to plain text.
      expect(styles(asType)).not.toEqual(styles(asStatement))
      expect(styles(asType)[0]).toContain('#B392F0')
      expect(styles(asStatement)[0]).toContain('#E1E4E8')
    })

    it('merges custom contexts over the built-ins', async () => {
      const custom = await inlineCode('`Ref<T>`{lang="ts-type"}', {
        grammarContexts: { 'sql-expr': { lang: 'sql' } },
      })
      expect(String((custom[1] as Record<string, unknown>).class)).toMatch(/^shiki /)
    })

    it('lets a registered grammar win over a built-in context', async () => {
      const plugin = shikiCore({ languages: [vueHtml], themes: { dark: githubDark } })
      const document = await parseMarkdown('`<b/>`{lang="vue-html"}', { plugins: [plugin] })
      const code = (document.nodes[0] as ElementNode)[2] as ElementNode

      // The built-in context would route `vue-html` through the `vue` grammar
      // seeded with `<template>`, which is not registered here. Highlighting at
      // all proves the real grammar was used.
      expect(String((code[1] as Record<string, unknown>).class)).toMatch(/^shiki /)
      expect(styles(code).some(Boolean)).toBe(true)
    })
  })

  describe('left untouched', () => {
    it('leaves inline code with no language alone', async () => {
      const code = await inlineCode('`plain`')
      expect(code).toEqual(['code', {}, 'plain'])
    })

    it('leaves inline code alone when inlineCode is false', async () => {
      const code = await inlineCode('`const a = 1`{lang="ts"}', { inlineCode: false })
      expect(code).toEqual(['code', { lang: 'ts' }, 'const a = 1'])
    })
  })

  describe('core entry with an unregistered grammar', () => {
    it('leaves the node alone and keeps working afterwards', async () => {
      const plugin = shikiCore({ languages: [javascript], themes: { dark: githubDark } })

      const first = await parseMarkdown('`Ref<T>`{lang="ts-type"}', { plugins: [plugin] })
      expect((first.nodes[0] as ElementNode)[2]).toEqual(['code', { lang: 'ts-type' }, 'Ref<T>'])

      // A failed lookup must not poison the shared highlighter.
      const second = await parseMarkdown('```js\nconst a = 1\n```', { plugins: [plugin] })
      const pre = second.nodes[0] as ElementNode
      expect(String((pre[1] as Record<string, unknown>).class)).toContain('shiki')
      expect(Array.isArray((pre[2] as ElementNode)[2])).toBe(true)
    })
  })

  describe('interaction with fenced blocks', () => {
    it('does not treat a fenced block inner code as inline', async () => {
      const document = await parseMarkdown('```ts\nconst a = 1\n```', { plugins: [shiki()] })
      const pre = document.nodes[0] as ElementNode
      expect((pre[2] as ElementNode)[1]).toEqual({ class: 'language-ts' })
    })

    it('resolves a pseudo-language on a fence too', async () => {
      const document = await parseMarkdown('```ts-type\nRef<T>\n```', { plugins: [shiki()] })
      const pre = document.nodes[0] as ElementNode
      // The written language stays on the <pre> so the fence round-trips.
      expect((pre[1] as Record<string, unknown>).language).toBe('ts-type')
      expect(String((pre[1] as Record<string, unknown>).class)).toContain('shiki')
    })

    it('leaves untouched sibling nodes referentially identical', async () => {
      // Plugins run in registration order, so this captures the nodes shiki is
      // about to see. Only the paragraph holding the inline code may be
      // re-created; its siblings must come out as the very same arrays.
      let before: Node[] = []
      const capture: ComarkPlugin = {
        name: 'capture',
        post(state) {
          before = [...state.tree.nodes]
        },
      }

      const document = await parseMarkdown('# Heading\n\nSome `x`{lang="ts"} text\n\nUntouched', {
        plugins: [capture, shiki()],
      })

      expect(before).toHaveLength(3)
      expect(document.nodes[0]).toBe(before[0])
      expect(document.nodes[2]).toBe(before[2])
      expect(document.nodes[1]).not.toBe(before[1])
    })
  })

  it('keeps a user class behind the highlighter classes', async () => {
    const code = await inlineCode('`x`{lang="ts" .foo}')
    expect(String((code[1] as Record<string, unknown>).class)).toContain(' . foo')
  })
})
