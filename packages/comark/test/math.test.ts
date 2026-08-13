import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index.ts'
import { renderMarkdown } from '../src/render.ts'
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
      nodes: [['p', {}, 'Before ', ['math', {}, 'x^2'], ' after']],
    }

    expect(await renderMarkdown(document)).toBe('Before $x^2$ after')
  })

  it('keeps explicitly block math as a block inside a parent', async () => {
    const source = '> $$\n> x^2\n> $$'
    const document = await parseMarkdown(source, { plugins: [math()] })

    expect(await renderMarkdown(document)).toBe(source)
  })
})
