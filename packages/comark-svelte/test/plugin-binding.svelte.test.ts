import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parse } from 'comark'
import ComarkRenderer from '../src/components/ComarkRenderer.svelte'
import binding, { Binding } from '../src/plugins/binding'

async function renderMarkdown(markdown: string, props: Record<string, any> = {}) {
  const tree = await parse(markdown, { plugins: [binding()] })
  return render(ComarkRenderer, {
    tree,
    components: { binding: Binding },
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
