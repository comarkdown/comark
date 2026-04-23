import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parse } from 'comark'
import { ComarkRenderer } from '../src/components/ComarkRenderer'
import binding, { Binding } from '../src/plugins/binding'

async function renderMarkdown(markdown: string, props: Record<string, any> = {}) {
  const tree = await parse(markdown, { plugins: [binding()] })
  const html = renderToString(
    <ComarkRenderer
      tree={tree}
      components={{ binding: Binding }}
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
