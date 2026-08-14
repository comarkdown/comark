import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parseMarkdown } from 'comark'
import math, { Math } from '../../src/plugins/math'
import MarkdownDocument from '../../src/components/MarkdownDocument.svelte'
import Markdown from '../../src/components/Markdown.svelte'

describe('Math component', () => {
  it('renders inline math with KaTeX', async () => {
    const screen = await render(Math, { content: 'x^2', class: 'inline' })
    const wrapper = screen.container.querySelector<HTMLElement>('.math.inline')!
    expect(wrapper).not.toBeNull()
    expect(wrapper.querySelector('.katex')).not.toBeNull()
  })

  it('renders display math with KaTeX', async () => {
    const screen = await render(Math, { content: 'E = mc^2', class: '' })
    const wrapper = screen.container.querySelector<HTMLElement>('.math.block')!
    expect(wrapper).not.toBeNull()
    expect(wrapper.querySelector('.katex')).not.toBeNull()
  })

  it('handles invalid LaTeX gracefully', async () => {
    const screen = await render(Math, { content: '\\invalid{', class: '' })
    const wrapper = screen.container.querySelector<HTMLElement>('.math.block')!
    expect(wrapper).not.toBeNull()
  })
})

describe('Math + MarkdownDocument integration', () => {
  it('renders inline math from parsed markdown', async () => {
    const tree = await parseMarkdown('The formula $x^2$ is simple', {
      plugins: [math()],
    })
    const screen = await render(MarkdownDocument, {
      value: tree,
      components: { math: Math },
    })
    await expect.element(screen.getByText(/The formula/)).toBeInTheDocument()
    const inlineMath = screen.container.querySelector<HTMLElement>('.math.inline')!
    expect(inlineMath).not.toBeNull()
    expect(inlineMath.querySelector('.katex')).not.toBeNull()
  })

  it('renders display math from parsed markdown', async () => {
    const tree = await parseMarkdown('$$\nE = mc^2\n$$', {
      plugins: [math()],
    })
    const screen = await render(MarkdownDocument, {
      value: tree,
      components: { math: Math },
    })
    const blockMath = screen.container.querySelector<HTMLElement>('.math.block')!
    expect(blockMath).not.toBeNull()
    expect(blockMath.querySelector('.katex')).not.toBeNull()
  })
})

describe('Math + Markdown integration', () => {
  it('renders math end-to-end via Markdown component', async () => {
    const screen = await render(Markdown, {
      value: 'Inline $a+b$ and display:\n\n$$\nc^2\n$$',
      plugins: [math()],
      components: { math: Math },
    })

    await expect.element(screen.getByText(/Inline/)).toBeInTheDocument()
    const inlineMath = screen.container.querySelector<HTMLElement>('.math.inline')!
    expect(inlineMath).not.toBeNull()
    expect(inlineMath.querySelector('.katex')).not.toBeNull()

    const blockMath = screen.container.querySelector<HTMLElement>('.math.block')!
    expect(blockMath).not.toBeNull()
    expect(blockMath.querySelector('.katex')).not.toBeNull()
  })
})
