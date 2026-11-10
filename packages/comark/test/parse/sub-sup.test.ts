import { describe, expect, it } from 'vitest'
import type { MarkdownItPlugin } from '../../src/types'
import { createMarkdownParser, defineComarkPlugin, parseMarkdown } from '../../src/index'

// Minimal inline rules that mirror what `markdown-it-sub` / `markdown-it-sup`
// emit: `~text~` → sub_open/text/sub_close, `^text^` → sup_open/text/sup_close.
// This lets the test pin the bug from comarkdown/comark#201 without pulling in
// the upstream packages.
function makeDelimiterRule(tag: 'sub' | 'sup', char: number) {
  return (state: any, silent: boolean) => {
    if (silent) return false
    if (state.src.charCodeAt(state.pos) !== char) return false

    const start = state.pos + 1
    const max = state.posMax
    let pos = start
    while (pos < max && state.src.charCodeAt(pos) !== char) {
      if (state.src.charCodeAt(pos) === 0x20 /* space */) return false
      pos++
    }
    if (pos === start || pos >= max) return false

    state.push(`${tag}_open`, tag, 1)
    const text = state.push('text', '', 0)
    text.content = state.src.slice(start, pos)
    state.push(`${tag}_close`, tag, -1)

    state.pos = pos + 1
    return true
  }
}

const markdownItSub: MarkdownItPlugin = (md) => {
  md.inline.ruler.after('emphasis', 'sub', makeDelimiterRule('sub', 0x7e /* ~ */))
}

const markdownItSup: MarkdownItPlugin = (md) => {
  md.inline.ruler.after('emphasis', 'sup', makeDelimiterRule('sup', 0x5e /* ^ */))
}

const subscript = defineComarkPlugin(() => ({
  name: 'subscript',
  markdownItPlugins: [markdownItSub],
}))

const superscript = defineComarkPlugin(() => ({
  name: 'superscript',
  markdownItPlugins: [markdownItSup],
}))

describe('sub/sup token mapping (regression for #201)', () => {
  it('maps sub_open tokens to a <sub> element (not <del>)', async () => {
    const tree = await parseMarkdown('H~2~O', { plugins: [subscript()] })
    expect(tree.nodes).toEqual([['p', {}, 'H', ['sub', {}, '2'], 'O']])
  })

  it('maps sup_open tokens to a <sup> element (not dropped)', async () => {
    const tree = await parseMarkdown('x^2^', { plugins: [superscript()] })
    expect(tree.nodes).toEqual([['p', {}, 'x', ['sup', {}, '2']]])
  })

  it('preserves both sub and sup in the same paragraph', async () => {
    const tree = await parseMarkdown('H~2~O and x^2^', { plugins: [subscript(), superscript()] })
    expect(tree.nodes).toEqual([['p', {}, 'H', ['sub', {}, '2'], 'O and x', ['sup', {}, '2']]])
  })
})

describe('subscripts with auto-close (regression for #462)', () => {
  const plugins = [subscript()]

  it.each([
    ['a~footnote~', ['p', {}, 'a', ['sub', {}, 'footnote']]],
    ['x~ab~.', ['p', {}, 'x', ['sub', {}, 'ab'], '.']],
    ['H~2~O and CO~2~', ['p', {}, 'H', ['sub', {}, '2'], 'O and CO', ['sub', {}, '2']]],
    ['H~2~', ['p', {}, 'H', ['sub', {}, '2']]],
    ['foo~bar~baz', ['p', {}, 'foo~bar~baz']],
    ['20~25 and 30~40', ['p', {}, '20~25 and 30~40']],
  ])('parses %j', async (input, expected) => {
    expect((await parseMarkdown(input, { plugins })).nodes).toEqual([expected])
  })

  it('parses subscripts while streaming', async () => {
    const parse = createMarkdownParser({ plugins })
    for (const chunk of ['Water is H~2', 'Water is H~2~', 'Water is H~2~O and a~note']) {
      await parse(chunk, { streaming: true })
    }
    const result = await parse('Water is H~2~O and a~note~', { streaming: true })
    expect(result.nodes).toMatchObject([['p', {}, 'Water is H', ['sub', {}, '2'], 'O and a', ['sub', {}, 'note']]])
  })
})
