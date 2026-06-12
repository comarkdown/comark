import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'

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
      const tree = await parse('The server is running on :8100')
      expect(tree.nodes).toEqual([['p', {}, 'The server is running on :8100']])
    })

    it('keeps a colon followed by digits as plain text mid-sentence', async () => {
      const tree = await parse('Meet me at :30 past the hour')
      expect(tree.nodes).toEqual([['p', {}, 'Meet me at :30 past the hour']])
    })

    it('still parses a valid letter-led inline component', async () => {
      const tree = await parse('an :inline-component here')
      expect(tree.nodes).toEqual([['p', {}, 'an ', ['inline-component', {}], ' here']])
    })

    it('still parses an inline component with bracket content', async () => {
      const tree = await parse('a :badge[New] tag')
      expect(tree.nodes).toEqual([['p', {}, 'a ', ['badge', {}, 'New'], ' tag']])
    })

    it('still allows digits after the leading letter (`:h2`)', async () => {
      const tree = await parse('see :h2 below')
      expect(tree.nodes).toEqual([['p', {}, 'see ', ['h2', {}], ' below']])
    })
  })

  describe('block components', () => {
    it('does not throw on a numeric `:name` shorthand', async () => {
      const tree = await parse(':8100')
      expect(tree.nodes).toEqual([['p', {}, ':8100']])
    })

    it('does not throw on a numeric `:name` shorthand with following content', async () => {
      const tree = await parse(':8100\nhello')
      expect(tree.nodes).toEqual([['p', {}, ':8100\nhello']])
    })

    it('does not throw on a numeric `::name` block', async () => {
      const tree = await parse('::8100')
      expect(tree.nodes).toEqual([['p', {}, '::8100']])
    })

    it('still parses a valid `::name` block component', async () => {
      const tree = await parse('::alert\nHello\n::')
      expect(tree.nodes).toEqual([['alert', {}, 'Hello']])
    })
  })
})
