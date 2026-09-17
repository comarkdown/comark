import { describe, expect, it } from 'vitest'
import { createMarkdownParser, parseMarkdown } from '../src/parse.ts'

describe('ParserOptions.autoClose', () => {
  describe("default ('streaming')", () => {
    it('leaves an unmatched emphasis opener literal on a plain parse', async () => {
      const tree = await parseMarkdown('a _b')
      expect(tree.nodes).toEqual([['p', {}, 'a _b']])
    })

    it('heals when parseMarkdown is given the streaming parse option', async () => {
      const tree = await parseMarkdown('a _b', {}, { streaming: true })
      expect(tree.nodes).toEqual([['p', { $: { line: 1 } }, 'a ', ['em', {}, 'b']]])
    })

    it('heals when the parse call opts into streaming', async () => {
      const parse = createMarkdownParser()
      const tree = await parse('a _b', { streaming: true })
      expect(tree.nodes).toEqual([['p', { $: { line: 1 } }, 'a ', ['em', {}, 'b']]])
    })

    it('keeps a trailing `::` literal instead of dropping it', async () => {
      // Healing strips a half-typed `::` on its own line, a plain parse must not.
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
    it('runs on a plain, non-streaming parse', async () => {
      const tree = await parseMarkdown('a _b', { autoClose: (markdown) => `${markdown}_` })
      expect(tree.nodes).toEqual([['p', {}, 'a ', ['em', {}, 'b']]])
    })
  })
})
