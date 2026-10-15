import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse'

// Regression tests for component-name validation.
//
// A component name must start with a letter or `$`. Before the fix, a colon
// followed by digits was captured as a component name:
//   - inline `:8100` produced `['8100', {}]`, making renderers call
//     `createElement('8100')` and crash the app;
//   - block `:8100` / `::8100` made `parseBlockParams` throw `Invalid block
//     params` during parsing.
// In all of these cases the colon sequence should stay plain text.
describe('component name validation', () => {
  describe('inline components', () => {
    it('keeps `:8100` as plain text (does not parse digits as a component)', async () => {
      const tree = await parseMarkdown('The server is running on :8100')
      expect(tree.nodes).toEqual([['p', {}, 'The server is running on :8100']])
    })

    it('keeps a colon followed by digits as plain text mid-sentence', async () => {
      const tree = await parseMarkdown('Meet me at :30 past the hour')
      expect(tree.nodes).toEqual([['p', {}, 'Meet me at :30 past the hour']])
    })

    it('parses consecutive inline components without spaces', async () => {
      const tree = await parseMarkdown(':b[text]:i[text]')
      expect(tree.nodes).toEqual([['p', {}, ['b', {}, 'text'], ['i', {}, 'text']]])
    })

    it('parses inline components after attributes', async () => {
      const tree = await parseMarkdown(':b[text]{id="x"}:i[text]')
      expect(tree.nodes).toEqual([['p', {}, ['b', { id: 'x' }, 'text'], ['i', {}, 'text']]])
    })

    it('still parses a valid letter-led inline component', async () => {
      const tree = await parseMarkdown('an :inline-component here')
      expect(tree.nodes).toEqual([['p', {}, 'an ', ['inline-component', {}], ' here']])
    })

    it('still parses an inline component with bracket content', async () => {
      const tree = await parseMarkdown('a :badge[New] tag')
      expect(tree.nodes).toEqual([['p', {}, 'a ', ['badge', {}, 'New'], ' tag']])
    })

    it('still allows digits after the leading letter (`:h2`)', async () => {
      const tree = await parseMarkdown('see :h2 below')
      expect(tree.nodes).toEqual([['p', {}, 'see ', ['h2', {}], ' below']])
    })
  })

  describe('block components', () => {
    it('does not throw on a numeric `:name` shorthand', async () => {
      const tree = await parseMarkdown(':8100')
      expect(tree.nodes).toEqual([['p', {}, ':8100']])
    })

    it('does not throw on a numeric `:name` shorthand with following content', async () => {
      const tree = await parseMarkdown(':8100\nhello')
      expect(tree.nodes).toEqual([['p', {}, ':8100\nhello']])
    })

    it('does not throw on a numeric `::name` block', async () => {
      const tree = await parseMarkdown('::8100')
      expect(tree.nodes).toEqual([['p', {}, '::8100']])
    })

    it('still parses a valid `::name` block component', async () => {
      const tree = await parseMarkdown('::alert\nHello\n::')
      expect(tree.nodes).toEqual([['alert', {}, 'Hello']])
    })
  })

  describe('component slots', () => {
    it('does not throw on a malformed slot marker #[]', async () => {
      const tree = await parseMarkdown('::component\n#[]\n::')
      expect(tree.nodes).toEqual([['component', {}, '#', ['span', {}]]])
    })

    it('does not throw on a malformed slot marker #{}', async () => {
      const tree = await parseMarkdown('::component\n#{}\n::')
      expect(tree.nodes).toEqual([['component', {}, '#']])
    })

    it('does not throw on a malformed slot marker #name!', async () => {
      const tree = await parseMarkdown('::component\n#slot!\n::')
      expect(tree.nodes).toEqual([['component', {}, '#slot!']])
    })

    it('does not throw on a malformed slot marker #name!', async () => {
      const tree = await parseMarkdown('::Component\n#slot!\n::')
      expect(tree.nodes).toEqual([['component', {}, '#slot!']])
    })

    it('still parses a valid slot marker #name', async () => {
      const tree = await parseMarkdown('::Component\n#slot\nhello\n::')
      expect(tree.nodes).toEqual([['component', {}, ['template', { name: 'slot' }, 'hello']]])
    })
  })
})
