import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import MarkdownNode from '../src/components/MarkdownNode.svelte'

const HTML = 'http://www.w3.org/1999/xhtml'
const SVG = 'http://www.w3.org/2000/svg'
const MATHML = 'http://www.w3.org/1998/Math/MathML'

describe('element namespaces', () => {
  it('creates MathML elements and their descendants in the MathML namespace', async () => {
    const screen = await render(MarkdownNode, {
      node: ['p', {}, ['math', {}, ['mfrac', {}, ['mi', {}, 'a'], ['mi', {}, 'b']]]],
    })
    const { container } = screen
    expect(container.querySelector('p')!.namespaceURI).toBe(HTML)
    for (const tag of ['math', 'mfrac', 'mi']) expect(container.querySelector(tag)!.namespaceURI).toBe(MATHML)
  })

  it('creates SVG descendants in the SVG namespace and returns to HTML in foreignObject', async () => {
    const screen = await render(MarkdownNode, {
      node: [
        'svg',
        { viewBox: '0 0 10 10' },
        ['rect', { width: '10', height: '10' }],
        ['foreignObject', {}, ['div', {}, 'x']],
      ],
    })
    const { container } = screen
    expect(container.querySelector('svg')!.namespaceURI).toBe(SVG)
    expect(container.querySelector('rect')!.namespaceURI).toBe(SVG)
    expect(container.querySelector('foreignObject')!.namespaceURI).toBe(SVG)
    expect(container.querySelector('div')!.namespaceURI).toBe(HTML)
  })
})
