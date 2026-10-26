import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import math, { renderMath, validateMath } from '../../src/plugins/math'

describe('math plugin', () => {
  it('parses inline and display math without loading katex', async () => {
    const { nodes } = await parseMarkdown('Inline $x^2$ and display $$E = mc^2$$', {
      plugins: [math()],
    })

    expect(JSON.stringify(nodes)).toContain('math')
  })

  it('renders math lazily via katex', async () => {
    await expect(renderMath('E = mc^2', false)).resolves.toContain('katex')
  })

  it('validates math lazily via katex', async () => {
    await expect(validateMath('E = mc^2')).resolves.toBe(true)
    await expect(validateMath('\\invalid')).resolves.toBe(false)
  })
})

describe('math plugin with brackets', () => {
  const parse = (markdown: string, brackets = true) =>
    parseMarkdown(markdown, { plugins: [math({ brackets })] }).then((tree) => tree.nodes)

  it('parses \\(…\\) as inline math', async () => {
    expect(await parse('Area \\(\\pi r^2\\) here')).toEqual([
      [
        'p',
        {},
        'Area ',
        ['math', { class: 'math inline', content: '\\pi r^2', $: { markup: '\\(' } }, '\\pi r^2'],
        ' here',
      ],
    ])
  })

  it('parses \\[…\\] lines as display math', async () => {
    expect(await parse('\\[\nx = \\frac{-b}{2a}\n\\]')).toEqual([
      ['math', { class: 'math block', content: 'x = \\frac{-b}{2a}', $: { markup: '\\[' } }, 'x = \\frac{-b}{2a}'],
    ])
    expect(await parse('\\[ E = mc^2 \\]')).toEqual([
      ['math', { class: 'math block', content: ' E = mc^2 ', $: { markup: '\\[' } }, ' E = mc^2 '],
    ])
  })

  it('parses \\[…\\] inside a paragraph', async () => {
    expect(await parse('so \\[x^2\\] holds')).toEqual([
      ['p', {}, 'so ', ['math', { class: 'math inline', content: 'x^2', $: { markup: '\\[' } }, 'x^2'], ' holds'],
    ])
  })

  it('keeps escaped brackets that are not math', async () => {
    expect(await parse('See \\[1\\] and \\[2, 3\\].')).toEqual([['p', {}, 'See [1] and [2, 3].']])
    expect(await parse('\\[not a link\\](https://example.com)')).toEqual([
      ['p', {}, '[not a link](', ['a', { href: 'https://example.com' }, 'https://example.com'], ')'],
    ])
    expect(await parse('Unclosed \\( paren')).toEqual([['p', {}, 'Unclosed ( paren']])
    expect(await parse('Escaped \\\\(x\\\\)')).toEqual([['p', {}, 'Escaped \\(x\\)']])
  })

  it('stops display math at a blank line', async () => {
    expect(await parse('\\[\nx\n\ny\n\\]')).toEqual([
      ['p', {}, '[\nx'],
      ['p', {}, 'y\n]'],
    ])
  })

  it('leaves code spans and fences alone', async () => {
    expect(await parse('`\\(x\\)`')).toEqual([['p', {}, ['code', {}, '\\(x\\)']]])
    expect(await parse('```\n\\[x\\]\n```')).toEqual([['pre', {}, ['code', {}, '\\[x\\]']]])
  })

  it('treats \\( and \\[ as escapes by default', async () => {
    expect(await parse('\\(x\\) and \\[y\\]', false)).toEqual([['p', {}, '(x) and [y]']])
  })

  it('keeps auto-close out of closed bracket math', async () => {
    expect(await parse('Area \\(a^*\\)')).toEqual([
      ['p', {}, 'Area ', ['math', { class: 'math inline', content: 'a^*', $: { markup: '\\(' } }, 'a^*']],
    ])
    expect(await parse('\\[\nx `y\n\\]')).toEqual([
      ['math', { class: 'math block', content: 'x `y', $: { markup: '\\[' } }, 'x `y'],
    ])
  })

  it('keeps auto-close out of indented \\[ blocks', async () => {
    const block = ['math', { class: 'math block', content: 'x *y', $: { markup: '\\[' } }, 'x *y']
    expect(await parse('  \\[\n  x *y\n  \\]')).toEqual([block])
    expect(await parse('- step\n  \\[\n  x *y\n  \\]')).toEqual([['ul', {}, ['li', {}, ['p', {}, 'step'], block]]])
  })

  it('heals a \\[ span that the block rule rejects', async () => {
    expect(await parse('\\[\nx *y\n\\] tail')).toEqual([['p', {}, '[\nx ', ['em', {}, 'y\n] tail']]])
  })

  it('still heals inside \\(…\\) without brackets', async () => {
    expect(await parse('Area \\(the *word\\)', false)).toEqual([['p', {}, 'Area (the ', ['em', {}, 'word)']]])
  })
})
