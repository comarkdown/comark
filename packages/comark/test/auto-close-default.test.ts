import { describe, expect, it } from 'vitest'
import { createMarkdownParser, parseMarkdown } from '../src/parse.ts'

describe('ParserOptions.autoClose', () => {
  describe("default ('streaming')", () => {
    it('leaves an unmatched emphasis opener literal on a plain parse', async () => {
      const tree = await parseMarkdown('a _b')
      expect(tree.nodes).toEqual([['p', {}, 'a _b']])
    })

    it('heals through parseMarkdown when the per-call options say streaming', async () => {
      // The third argument is the public streaming entry point. Nothing else
      // exercises it, so a merge that drops it would otherwise stay green.
      const tree = await parseMarkdown('a _b', {}, { streaming: true })
      expect(tree.nodes).toEqual([['p', { $: { line: 1 } }, 'a ', ['em', {}, 'b']]])
    })

    it('heals when the parse call opts into streaming', async () => {
      const parse = createMarkdownParser()
      const tree = await parse('a _b', { streaming: true })
      expect(tree.nodes).toEqual([['p', { $: { line: 1 } }, 'a ', ['em', {}, 'b']]])
    })

    it('leaves an unclosed component fence to the components plugin', async () => {
      const tree = await parseMarkdown('::alert\nHello')
      expect(tree.nodes).toEqual([['alert', {}, 'Hello']])
    })

    it('keeps a trailing `::` literal instead of dropping it', async () => {
      // Healing strips a half-typed `::` on its own line. A plain parse must not,
      // so the two nested-component fixtures no longer carry a stray closer.
      const tree = await parseMarkdown('para\n\n::')
      expect(tree.nodes).toEqual([
        ['p', {}, 'para'],
        ['p', {}, '::'],
      ])
    })
  })

  describe('true', () => {
    it('heals on a plain, non-streaming parse', async () => {
      const tree = await parseMarkdown('a _b', { autoClose: true })
      expect(tree.nodes).toEqual([['p', {}, 'a ', ['em', {}, 'b']]])
    })
  })

  describe('false', () => {
    it('never heals, even while streaming', async () => {
      const parse = createMarkdownParser({ autoClose: false })
      const tree = await parse('a _b', { streaming: true })
      expect(tree.nodes).toEqual([['p', { $: { line: 1 } }, 'a _b']])
    })
  })

  describe('custom function', () => {
    it('runs on a non-streaming parse', async () => {
      const tree = await parseMarkdown('a _b', { autoClose: (markdown) => `${markdown}_` })
      expect(tree.nodes).toEqual([['p', {}, 'a ', ['em', {}, 'b']]])
    })

    it('runs on a streaming parse', async () => {
      const parse = createMarkdownParser({ autoClose: (markdown) => `${markdown}_` })
      const tree = await parse('a _b', { streaming: true })
      expect(tree.nodes).toEqual([['p', { $: { line: 1 } }, 'a ', ['em', {}, 'b']]])
    })
  })
})
