import { describe, expect, it } from 'vitest'
import { createMarkdownSourceParser } from '../src/source.ts'

describe('source ranges', () => {
  it('retains valueless bindings so editors can respect their precedence', async () => {
    const elements = await createMarkdownSourceParser()(':Badge{href="/old" :href}')
    expect(elements[0].attributes.map((attribute) => attribute.name)).toEqual(['href', ':href'])
    expect(elements[0].attributes[1].range).toBeUndefined()
  })

  it.each(['\n', '\r\n'])(
    'locates original destinations and component attributes with %j newlines',
    async (newline) => {
      const source = [
        '---',
        'title: Keep /old',
        '---',
        '',
        '::::Card{href="/old?x=1#usage" title="Kept"}',
        "A :Badge[Status]{href='/old'} and :Icon{name=book href=/old}.",
        '[Direct](</old#details> "Title")',
        '::::',
      ].join(newline)
      const elements = await createMarkdownSourceParser()(source)
      expect(
        elements.flatMap((element) =>
          element.attributes
            .filter((attr) => attr.name === 'href')
            .map((attr) => source.slice(attr.range!.start, attr.range!.end))
        )
      ).toEqual(['/old?x=1#usage', '/old', '/old', '/old#details'])
    }
  )

  it('keeps duplicate and bound attributes associated with their own element', async () => {
    const source = ':Badge[One]{href="/old" href="/other"} :Badge[Two]{href="/old" :href="destination"}'
    const elements = await createMarkdownSourceParser()(source)
    expect(
      elements.map((element) =>
        element.attributes.map((attr) => [attr.name, source.slice(attr.range!.start, attr.range!.end)])
      )
    ).toEqual([
      [
        ['href', '/old'],
        ['href', '/other'],
      ],
      [
        ['href', '/old'],
        [':href', 'destination'],
      ],
    ])
  })

  it('excludes images, reference definitions, comments, and code samples', async () => {
    const source =
      '`[Code](/old)`\n\n```md\n:Badge{href="/old"}\n```\n\n<!-- :Badge{href="/old"} -->\n\n![Image](/old)\n\n[Reference][shared]\n\n[shared]: /old\n\n[Direct](/real)'
    const elements = await createMarkdownSourceParser()(source)
    expect(
      elements.flatMap((element) => element.attributes.map((attr) => source.slice(attr.range!.start, attr.range!.end)))
    ).toEqual(['/real'])
  })

  it('maps links inside lists, blockquotes, component labels, and table cells', async () => {
    const source =
      '- [List](/list)\n\n> [Quote](/quote)\n\n:Card[[Label](/label)]{href="/card"}\n\n| A | B |\n| --- | --- |\n| [One](/one) | [Two](/two) |'
    const elements = await createMarkdownSourceParser()(source)
    expect(
      elements.flatMap((element) =>
        element.attributes
          .filter((attr) => attr.name === 'href')
          .map((attr) => source.slice(attr.range!.start, attr.range!.end))
      )
    ).toEqual(['/list', '/quote', '/card', '/label', '/one', '/two'])
  })

  it('keeps concurrent parser calls independent', async () => {
    const parse = createMarkdownSourceParser()
    const sources = ['[First](/first)', ':Card{href="/second"}']
    const results = await Promise.all(sources.map((source) => parse(source)))
    expect(
      results.map((elements, index) =>
        elements.flatMap((element) =>
          element.attributes.map((attr) => sources[index].slice(attr.range!.start, attr.range!.end))
        )
      )
    ).toEqual([['/first'], ['/second']])
  })
})
