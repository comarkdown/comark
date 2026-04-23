import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parse } from 'comark'
import ComarkRenderer from '../src/components/ComarkRenderer.svelte'
import Badge from './test-components/Badge.svelte'
import Card from './test-components/Card.svelte'

async function renderMarkdown(markdown: string, props: Record<string, any> = {}) {
  const tree = await parse(markdown)
  return render(ComarkRenderer, { tree, ...props })
}

describe('ComarkRenderer — data binding', () => {
  it('resolves :prefix bindings from frontmatter onto component props', async () => {
    const screen = await renderMarkdown(
      `---
site:
  name: My Blog
---

::badge{:label="frontmatter.site.name"}
::
`,
      { components: { badge: Badge } }
    )
    const badge = screen.container.querySelector<HTMLElement>('.badge')!
    expect(badge).not.toBeNull()
    expect(badge.textContent?.trim()).toBe('My Blog')
  })

  it('JSON-parses numeric literals so components receive real numbers', async () => {
    const screen = await renderMarkdown(
      `::badge{:count="42"}
::`,
      { components: { badge: Badge } }
    )
    const badge = screen.container.querySelector<HTMLElement>('.badge')!
    expect(badge.getAttribute('data-count')).toBe('42')
  })

  it('JSON-parses object literals into real objects', async () => {
    const screen = await renderMarkdown(
      `::badge{:config='{"k":"v"}'}
::`,
      { components: { badge: Badge } }
    )
    const badge = screen.container.querySelector<HTMLElement>('.badge')!
    expect(badge.getAttribute('data-config')).toBe('{"k":"v"}')
  })

  it('resolves bindings from the renderer `data` prop', async () => {
    const screen = await renderMarkdown(
      `::badge{:label="data.user.name"}
::`,
      { components: { badge: Badge }, data: { user: { name: 'Ada' } } }
    )
    const badge = screen.container.querySelector<HTMLElement>('.badge')!
    expect(badge.textContent?.trim()).toBe('Ada')
  })

  it('exposes parent component props to nested :prefix bindings', async () => {
    const screen = await renderMarkdown(
      `::card{title="Hello" variant="primary"}
:::badge{:label="props.title"}
:::
::
`,
      { components: { card: Card, badge: Badge } }
    )
    const card = screen.container.querySelector<HTMLElement>('.card')!
    expect(card).toHaveClass('card-primary')
    const badge = card.querySelector<HTMLElement>('.badge')!
    expect(badge).not.toBeNull()
    expect(badge.textContent?.trim()).toBe('Hello')
  })

  it('yields undefined for unresolved paths (component uses its default)', async () => {
    const screen = await renderMarkdown(
      `::badge{:label="frontmatter.missing"}
::`,
      { components: { badge: Badge } }
    )
    const badge = screen.container.querySelector<HTMLElement>('.badge')!
    expect(badge).not.toBeNull()
    // default label is '' — dot-path that doesn't resolve must not leak the
    // raw string into the DOM.
    expect(badge.textContent).not.toContain('frontmatter.missing')
  })

  it('leaves non-:prefix attributes untouched', async () => {
    const screen = await renderMarkdown(
      `---
site: Blog
---

::badge{label="frontmatter.site"}
::
`,
      { components: { badge: Badge } }
    )
    const badge = screen.container.querySelector<HTMLElement>('.badge')!
    expect(badge.textContent?.trim()).toBe('frontmatter.site')
  })
})
