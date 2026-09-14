import { forCases } from '../../../test/fixtures/for'
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import binding, { Binding, For, If } from '../src/plugins/binding'
import { nestedIfCases, nestedIfMarkdown } from '../../../test/fixtures/if'

async function renderMarkdown(markdown: string, props: Record<string, any> = {}) {
  const tree = await parseMarkdown(markdown, { plugins: [binding()] })
  const html = renderToString(
    <MarkdownDocument
      value={tree}
      components={{ binding: Binding, For, If }}
      {...props}
    />
  )
  // React SSR inserts `<!-- -->` separators between adjacent text nodes; strip
  // them so assertions compare against the visible text.
  return html.replace(/<!--\s*-->/g, '')
}

describe('@comark/react plugins/binding — Binding component', () => {
  it('resolves `{{ path }}` against frontmatter', async () => {
    const html = await renderMarkdown(`---
user:
  name: Ada
---

Hello {{ frontmatter.user.name }}!
`)
    expect(html).toContain('Hello Ada!')
  })

  it('resolves `{{ path }}` from the renderer `data` prop', async () => {
    const html = await renderMarkdown('Score: {{ data.score }}', { data: { score: 42 } })
    expect(html).toContain('Score: 42')
  })

  it('falls back to the default when the path does not resolve', async () => {
    const html = await renderMarkdown('Hello {{ data.missing || guest }}!')
    expect(html).toContain('Hello guest!')
  })

  it('renders empty when path is unresolved and no default is provided', async () => {
    const html = await renderMarkdown('before-{{ missing.path }}-after')
    expect(html).toContain('before--after')
  })
})

describe('@comark/react plugins/binding — If component', () => {
  it.each(nestedIfCases)('selects nested branches for $data', async ({ data, expected }) => {
    const html = await renderMarkdown(nestedIfMarkdown, { data })
    expect(html.replace(/<[^>]*>/g, '')).toBe(expected)
    expect(html).not.toContain('<template')
  })

  it('wraps the else slot when a comparison fails', async () => {
    const html = await renderMarkdown('::if{:value="data.age" :gte="18" as="section"}\nAdult\n#else\nMinor\n::', {
      data: { age: 17 },
    })
    expect(html).toContain('<section>Minor</section>')
    expect(html).not.toContain('Adult')
  })

  it('renders matching branches with an optional wrapper', async () => {
    const markdown = '::if{:value="data.age" :gte="18" as="section"}\nAdult\n::'

    expect(await renderMarkdown(markdown, { data: { age: 21 } })).toContain('<section>Adult</section>')
    expect(await renderMarkdown(markdown, { data: { age: 17 } })).not.toContain('Adult')
  })
})

it.each(forCases)('For: $name', async ({ markdown, data, expected, absent }) => {
  const output = (await renderMarkdown(markdown, { data }))
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  for (const text of expected) expect(output).toContain(text)
  for (const text of absent) expect(output).not.toContain(text)
})
