import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse'
import { renderMarkdown } from '../src/render'
import type { MarkdownDocument } from '../src'

const paragraph = (...children: unknown[]): MarkdownDocument =>
  ({ frontmatter: {}, meta: {}, nodes: [['p', {}, ...children]] }) as MarkdownDocument

// A text node round-trips when re-parsing the rendered markdown yields the same
// literal text, instead of reinterpreting a character as markdown syntax.
async function roundTrip(text: string) {
  const md = await renderMarkdown(paragraph(text))
  const node = ((await parseMarkdown(md)) as any).nodes[0]
  return { md, node }
}

describe('text node escaping', () => {
  describe('escapes syntax that would otherwise be reparsed', () => {
    const cases: Record<string, string> = {
      'code span': 'use `ls` here',
      emphasis: 'a *b* and _c_ d',
      strikethrough: 'a ~~b~~ c',
      'raw html': 'render a <div> tag',
      entity: 'the &amp; entity',
      backslash: 'two \\\\ backslashes',
      'link brackets': '[foo](bar)',
      'leading heading': '# not a heading',
      'leading blockquote': '> not a quote',
      'leading bullet': '- not a list',
      'leading ordered list': '1. not a list',
      'leading thematic break': '--- not a rule',
    }

    for (const [name, text] of Object.entries(cases)) {
      it(name, async () => {
        const { node } = await roundTrip(text)
        expect(node).toEqual(['p', {}, text])
      })
    }
  })

  describe('leaves prose untouched when a character is not significant', () => {
    // Emphasis `_`, raw html `<` and entity `&` only start a construct in
    // certain positions, and block markers only at the start of a line.
    const clean = [
      'snake_case stays',
      'a_b_c',
      'a < b compare',
      'a<b tight',
      'x < y > z',
      'AT&T rocks',
      'r&d team',
      '#hashtag not a heading',
      '-dash not a bullet',
      '1.2 version',
      'C# and F#',
      'a heading # mid line',
    ]

    for (const text of clean) {
      it(text, async () => {
        const { md, node } = await roundTrip(text)
        expect(md).toBe(text)
        expect(node).toEqual(['p', {}, text])
      })
    }
  })

  it('escapes leading block markers only after a real line break', async () => {
    // `# heading` sits mid-line, so it stays literal; `- bullet` starts a line.
    const text = 'inline # heading\n- bullet'
    const { node } = await roundTrip(text)
    expect(node).toEqual(['p', {}, text])
  })

  it('does not escape markdown inside a raw HTML block', async () => {
    // Raw HTML block content is copied verbatim on parse, so `**World**` must
    // not gain backslashes.
    const document = await parseMarkdown('<Hello>\nHello **World**\n</Hello>')
    const md = await renderMarkdown(document)
    expect(md).toContain('Hello **World**')
    expect(md).not.toContain('\\*')
  })
})
