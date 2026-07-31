import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderHtml } from '../src/index'
import binding, { Binding } from '../src/plugins/binding'

const parseWithBinding = (md: string) => parseMarkdown(md, { plugins: [binding()] })

describe('@comark/html plugins/binding — Binding handler', () => {
  it('resolves a `{{ path }}` binding against frontmatter', async () => {
    const tree = await parseWithBinding(`---
user:
  name: Ada
---

Hello {{ frontmatter.user.name }}!
`)
    const html = await renderHtml(tree, { components: { binding: Binding } })
    expect(html).toContain('Hello Ada!')
    expect(html).not.toContain('<binding')
  })

  it('resolves a `{{ path }}` binding against the `data` render option', async () => {
    const tree = await parseWithBinding('Score: {{ data.score }}')
    const html = await renderHtml(tree, {
      components: { binding: Binding },
      data: { score: 42 },
    })
    expect(html).toContain('Score: 42')
  })

  it('falls back to `|| default` when the path does not resolve', async () => {
    const tree = await parseWithBinding('Hello {{ data.missing || guest }}!')
    const html = await renderHtml(tree, { components: { binding: Binding } })
    expect(html).toContain('Hello guest!')
  })

  it('renders empty output when path is unresolved and no default is provided', async () => {
    const tree = await parseWithBinding('before-{{ missing.path }}-after')
    const html = await renderHtml(tree, { components: { binding: Binding } })
    expect(html).toContain('before--after')
  })

  it('HTML-escapes resolved values', async () => {
    const tree = await parseWithBinding('X = {{ data.raw }}')
    const html = await renderHtml(tree, {
      components: { binding: Binding },
      data: { raw: '<script>alert(1)</script>' },
    })
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })
})
