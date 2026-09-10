import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parseMarkdown } from 'comark'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'
import binding, { Binding, If } from '../src/plugins/binding'

async function renderMarkdown(markdown: string, props: Record<string, any> = {}) {
  const tree = await parseMarkdown(markdown, { plugins: [binding()] })
  return render(MarkdownDocument, {
    value: tree,
    components: { binding: Binding, If },
    ...props,
  })
}

describe('@comark/svelte plugins/binding — Binding component', () => {
  it('resolves `{{ path }}` against frontmatter', async () => {
    const screen = await renderMarkdown(`---
user:
  name: Ada
---

Hello {{ frontmatter.user.name }}!
`)
    expect(screen.container.textContent).toContain('Hello Ada!')
  })

  it('resolves `{{ path }}` from the renderer `data` prop', async () => {
    const screen = await renderMarkdown('Score: {{ data.score }}', { data: { score: 42 } })
    expect(screen.container.textContent).toContain('Score: 42')
  })

  it('falls back to the default when the path does not resolve', async () => {
    const screen = await renderMarkdown('Hello {{ data.missing || guest }}!')
    expect(screen.container.textContent).toContain('Hello guest!')
  })

  it('renders empty when path is unresolved and no default is provided', async () => {
    const screen = await renderMarkdown('before-{{ missing.path }}-after')
    expect(screen.container.textContent).toContain('before--after')
  })
})

describe('@comark/svelte plugins/binding — If component', () => {
  it('renders matching branches with an optional wrapper', async () => {
    const markdown = '::if{:value="data.age" :gte="18" as="section"}\nAdult\n::'

    const visible = await renderMarkdown(markdown, { data: { age: 21 } })
    expect(visible.container.querySelector('section')?.textContent).toBe('Adult')

    const hidden = await renderMarkdown(markdown, { data: { age: 17 } })
    expect(hidden.container.textContent).not.toContain('Adult')
  })
})
