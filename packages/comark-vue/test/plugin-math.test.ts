import { describe, expect, it } from 'vitest'
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
})
