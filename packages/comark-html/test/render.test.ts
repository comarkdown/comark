import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { render } from 'comark/render'
import type { RendererOptions } from 'comark/render'
import { renderHtmlFromDocument } from '@comark/html/render'

// The generic renderer in HTML mode, which `@comark/html` used before it got its own renderer.
async function renderGeneric(document: Parameters<typeof render>[0], options: RendererOptions = {}) {
  return (await render(document, { blockSeparator: '\n', format: 'text/html', ...options })).trim()
}

describe('HTML renderer', () => {
  it.each([
    '# Heading\n\nHello **world** & <https://example.com>',
    '- One\n- Two\n\n> Quote',
    '| A | B |\n| - | - |\n| 1 | 2 |',
    '![Image](/image.png "Title")\n\n---',
    '<!-- comment -->\n\nText',
    '<pre>  literal\n    text</pre>\n\n<style>p { color: red; }</style>',
    '::card{title="T"}\n- :span[x]{:data-x="props.title"}\n::',
    '::card{title="T"}\n:::div{:href="data.bad"}\n:span[x]{:data-x="props.title"}\n:::\n::',
    ':a[link]{:href="data.bad"}\n\n:span[text]{title="<quoted>"}',
  ])('matches the existing HTML output for %s', async (source) => {
    const document = await parseMarkdown(source)
    const options = { data: { bad: 'javascript:alert(1)' } }
    expect(await renderHtmlFromDocument(document, options)).toBe(await renderGeneric(document, options))
  })

  it('supports async, conditional and PascalCase components with scoped data', async () => {
    const document = await parseMarkdown('::card{title="T"}\n:span[x]{:data-x="props.title"}\n::')
    const components = {
      Card: async ([, , ...children], { render, renderData, data }) => {
        await Promise.resolve()
        return `<article data-label="${data.label}" title="${renderData.props.title}">${await render(children)}</article>`
      },
      selected: {
        match: ([tag]) => tag === 'span',
        handler: async ([, , ...children], { render, renderData }) =>
          `<b title="${renderData.props['data-x']}">${await render(children)}</b>`,
      },
    } satisfies NonNullable<Parameters<typeof renderHtmlFromDocument>[1]>['components']
    const options = { components, data: { label: 'custom' } }
    const result = await renderHtmlFromDocument(document, options)
    expect(result).toBe(await renderGeneric(document, options))
    expect(result).toContain('<b title="T">x</b>')
  })

  it('supports bare documents and ignores inherited component properties', async () => {
    const document = {
      nodes: [
        ['constructor', {}, 'text'],
        ['__proto__', {}, 'safe'],
      ],
    } as const
    const nodes = structuredClone(document.nodes) as unknown as Awaited<ReturnType<typeof parseMarkdown>>['nodes']
    expect(await renderHtmlFromDocument({ nodes })).toBe(await renderGeneric({ nodes }))
  })

  it('passes the renderer state to components', async () => {
    const document = await parseMarkdown('::card\nHello **world**\n::')
    const result = await renderHtmlFromDocument(document, {
      components: {
        card: async (node, state) => {
          const revert = state.applyContext({ blockSeparator: '' })
          try {
            return `<section data-format="${state.context.format}">${await state.flow(node, state)}</section>`
          } finally {
            state.applyContext(revert)
          }
        },
      },
    })
    expect(result).toBe('<section data-format="text/html">Hello <strong>world</strong></section>')
  })
})
