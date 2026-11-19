import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index.ts'
import { renderMarkdown } from '../src/render/index.ts'
import math from '../src/plugins/math.ts'
import type { MarkdownDocument } from '../src/types.ts'

describe('math markdown rendering', () => {
  it('round-trips inline and block math delimiters', async () => {
    const source = String.raw`$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Inline $E = mc^2$ end.`
    const document = await parseMarkdown(source, { plugins: [math()] })

    expect(await renderMarkdown(document)).toBe(source)
  })

  it('renders a standalone inline math node with single-dollar delimiters', async () => {
    const document = await parseMarkdown('$x^2$', { plugins: [math()] })

    expect(await renderMarkdown(document)).toBe('$x^2$')
  })

  it('uses the parent as a fallback for classless inline math nodes', async () => {
    const document: MarkdownDocument = {
      frontmatter: {},
      meta: {},
      nodes: [['p', {}, 'Before ', ['math', { content: 'x^2' }, 'x^2'], ' after']],
    }

    expect(await renderMarkdown(document)).toBe('Before $x^2$ after')
  })

  it('writes a `math` node without math class or content as a component', async () => {
    const source = 'Some :math[x] text.\n\n::math{k="v"}\nbody\n::'
    const document = await parseMarkdown(source)

    expect(await renderMarkdown(document)).toBe(source)
  })

  it('keeps explicitly block math as a block inside a parent', async () => {
    const source = '> $$\n> x^2\n> $$'
    const document = await parseMarkdown(source, { plugins: [math()] })

    expect(await renderMarkdown(document)).toBe(source)
  })
})

describe('bracket math markdown rendering', () => {
  it('round-trips \\(…\\) and \\[…\\] delimiters', async () => {
    const source = String.raw`\[
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
\]

Inline \(E = mc^2\) and \[x^2\] end.`
    const document = await parseMarkdown(source, { plugins: [math({ brackets: true })] })

    expect(await renderMarkdown(document)).toBe(source)
  })
})

describe('dollar-prefixed tokens and auto-close (#136)', () => {
  const href = '/Users/user01/.codex/skills/.system/imagegen/SKILL.md'

  it('keeps a trailing `$skill-name` as plain text without the math plugin', async () => {
    const document = await parseMarkdown('$skill-name')

    expect(document.nodes).toEqual([['p', {}, '$skill-name']])
    expect(await renderMarkdown(document)).toBe('$skill-name')
  })

  it('keeps `$` inside link text without the math plugin', async () => {
    const source = `[$imagegen](${href})`
    const document = await parseMarkdown(source)

    expect(document.nodes).toEqual([['p', {}, ['a', { href }, '$imagegen']]])
    expect(await renderMarkdown(document)).toBe(source)
  })

  it('keeps a link and a trailing `$skill-name.` intact without the math plugin', async () => {
    const source = `Codex uses [$imagegen](${href}) and $skill-name.`
    const document = await parseMarkdown(source)

    expect(document.nodes).toEqual([['p', {}, 'Codex uses ', ['a', { href }, '$imagegen'], ' and $skill-name.']])
    expect(await renderMarkdown(document)).toBe(source)
  })

  it('auto-closes a trailing unclosed `$` when the math plugin is registered', async () => {
    const document = await parseMarkdown('Value $x', { plugins: [math()] })

    expect(document.nodes).toEqual([['p', {}, 'Value ', ['math', { class: 'math inline', content: 'x' }, 'x']]])
    expect(await renderMarkdown(document)).toBe('Value $x$')
  })
})
