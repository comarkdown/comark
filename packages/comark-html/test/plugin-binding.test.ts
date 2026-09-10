import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderHtmlFromDocument } from '../src/index'
import binding, { Binding, If } from '../src/plugins/binding'
import { nestedIfCases, nestedIfMarkdown } from '../../../test/fixtures/if'

const parseWithBinding = (md: string) => parseMarkdown(md, { plugins: [binding()] })

describe('@comark/html plugins/binding — Binding handler', () => {
  it('resolves a `{{ path }}` binding against frontmatter', async () => {
    const doc = await parseWithBinding(`---
user:
  name: Ada
---

Hello {{ frontmatter.user.name }}!
`)
    const html = await renderHtmlFromDocument(doc, { components: { binding: Binding } })
    expect(html).toContain('Hello Ada!')
    expect(html).not.toContain('<binding')
  })

  it('resolves a `{{ path }}` binding against the `data` render option', async () => {
    const doc = await parseWithBinding('Score: {{ data.score }}')
    const html = await renderHtmlFromDocument(doc, {
      components: { binding: Binding },
      data: { score: 42 },
    })
    expect(html).toContain('Score: 42')
  })

  it('falls back to `|| default` when the path does not resolve', async () => {
    const doc = await parseWithBinding('Hello {{ data.missing || guest }}!')
    const html = await renderHtmlFromDocument(doc, { components: { binding: Binding } })
    expect(html).toContain('Hello guest!')
  })

  it('renders empty output when path is unresolved and no default is provided', async () => {
    const doc = await parseWithBinding('before-{{ missing.path }}-after')
    const html = await renderHtmlFromDocument(doc, { components: { binding: Binding } })
    expect(html).toContain('before--after')
  })

  it('HTML-escapes resolved values', async () => {
    const doc = await parseWithBinding('X = {{ data.raw }}')
    const html = await renderHtmlFromDocument(doc, {
      components: { binding: Binding },
      data: { raw: '<script>alert(1)</script>' },
    })
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })
})

describe('@comark/html plugins/binding — If handler', () => {
  it.each(nestedIfCases)('selects nested branches for $data', async ({ data, expected }) => {
    const doc = await parseMarkdown(nestedIfMarkdown)
    const html = await renderHtmlFromDocument(doc, { components: { If }, data })
    expect(html.replace(/<[^>]*>/g, '')).toBe(expected)
    expect(html).not.toContain('<template')
  })

  it.each([true, false])('does not invoke the inactive branch handler for %s', async (show) => {
    const doc = await parseMarkdown(
      `::if{:value="data.show"}\n${show ? 'Visible' : ':probe'}\n#else\n${show ? ':probe' : 'Hidden'}\n::`
    )
    const html = await renderHtmlFromDocument(doc, {
      components: {
        If,
        probe: () => {
          throw new Error('Inactive branch rendered')
        },
      },
      data: { show },
    })
    expect(html).toContain(show ? 'Visible' : 'Hidden')
  })

  it.each([true, false])('selects the default or else slot for value %s', async (show) => {
    const doc = await parseMarkdown('::if{:value="data.show" as="section"}\nVisible\n#else\nHidden\n::')
    const html = await renderHtmlFromDocument(doc, { components: { If }, data: { show } })
    expect(html).toBe(show ? '<section><p>Visible</p></section>' : '<section>Hidden</section>')
  })

  it('renders only truthy branches without requiring the binding parser plugin', async () => {
    const doc = await parseMarkdown('::if{:condition="data.show"}\nVisible\n::')

    const visible = await renderHtmlFromDocument(doc, {
      components: { If },
      data: { show: true },
    })
    const hidden = await renderHtmlFromDocument(doc, {
      components: { If },
      data: { show: false },
    })

    expect(visible).toBe('Visible')
    expect(hidden).toBe('')
  })

  it('exposes normalized If props to bindings in its children', async () => {
    const doc = await parseWithBinding('::if{:condition="true" :enabled="false"}\nEnabled {{ props.enabled }}\n::')
    const html = await renderHtmlFromDocument(doc, { components: { Binding, If } })

    expect(html).toBe('Enabled false')
  })
})
