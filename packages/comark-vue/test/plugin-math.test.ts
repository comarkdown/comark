import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import math, { Math } from '../src/plugins/math'

describe('@comark/vue plugins/math — Math component', () => {
  it('waits for KaTeX in server rendering', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(Math, { content: 'x^2', class: 'math inline' }) }))

    expect(html).toContain('<span class="math inline"><span class="katex">')
  })

  it('shows the escaped TeX source when KaTeX cannot parse it', async () => {
    const tree = await parseMarkdown('$\\frac{<b>}{$', { plugins: [math()] })
    const app = createSSRApp({
      setup: () => () => h(MarkdownDocument, { value: tree, components: { math: Math } }),
    })

    expect(await renderToString(app)).toContain('<span class="math inline">\\frac{&lt;b&gt;}{</span>')
  })

  it('loads KaTeX again after a failed load', async () => {
    vi.resetModules()
    let fail = true
    vi.doMock('katex', async (importOriginal) => {
      if (fail) throw new Error('Failed to fetch dynamically imported module')
      return importOriginal()
    })
    const { Math } = await import('../src/plugins/math')
    const { createSSRApp, h } = await import('vue')
    const { renderToString } = await import('@vue/server-renderer')
    const render = () =>
      renderToString(createSSRApp({ render: () => h(Math, { content: 'x^2', class: 'math inline' }) }))

    try {
      expect(await render()).toContain('<span class="math inline">x^2</span>')
      fail = false
      expect(await render()).toContain('<span class="math inline"><span class="katex">')
    } finally {
      vi.doUnmock('katex')
    }
  })
})
