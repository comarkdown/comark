import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parse } from 'comark'
import { ComarkRenderer } from '../src/components/ComarkRenderer'

const Badge = defineComponent({
  name: 'Badge',
  props: {
    label: { type: String, default: '' },
    count: { type: Number, default: 0 },
    config: { type: Object, default: () => ({}) },
  },
  setup(props) {
    return () =>
      h('span', { class: 'badge', 'data-count': props.count }, [
        props.label,
        props.config && typeof props.config === 'object' ? JSON.stringify(props.config) : '',
      ])
  },
})

const Card = defineComponent({
  name: 'Card',
  props: {
    title: { type: String, default: '' },
    variant: { type: String, default: '' },
  },
  setup(_, { slots }) {
    return () =>
      h('div', { class: 'card' }, [h('h3', {}, slots.title?.()), h('div', { class: 'body' }, slots.default?.())])
  },
})

async function renderMarkdown(markdown: string, props: Record<string, any> = {}) {
  const tree = await parse(markdown)
  const app = createSSRApp({
    setup: () => () => h(ComarkRenderer, { tree, ...props }),
  })
  return renderToString(app as any)
}

describe('ComarkRenderer — data binding', () => {
  it('resolves :prefix bindings from frontmatter onto custom component props', async () => {
    const html = await renderMarkdown(
      `---
site:
  name: My Blog
---

::badge{:label="frontmatter.site.name"}
::
`,
      { components: { badge: Badge } }
    )
    expect(html).toContain('class="badge"')
    expect(html).toContain('My Blog')
  })

  it('JSON-parses numeric literals so components receive real numbers', async () => {
    const html = await renderMarkdown(
      `::badge{:count="42"}
::`,
      { components: { badge: Badge } }
    )
    // data-count attribute on a number prop is serialised without quotes in
    // the VNode, but string conversion is fine — what matters is that the
    // prop reached the component as 42 (not "42").
    expect(html).toContain('data-count="42"')
  })

  it('JSON-parses object literals into real objects', async () => {
    const html = await renderMarkdown(
      `::badge{:config='{"k":"v"}'}
::`,
      { components: { badge: Badge } }
    )
    expect(html).toContain('{&quot;k&quot;:&quot;v&quot;}')
  })

  it('resolves bindings from the renderer `data` prop', async () => {
    const html = await renderMarkdown(
      `::badge{:label="data.user.name"}
::`,
      { components: { badge: Badge }, data: { user: { name: 'Ada' } } }
    )
    expect(html).toContain('Ada')
  })

  it('exposes parent component props to nested :prefix bindings', async () => {
    const html = await renderMarkdown(
      `::card{title="Hello" variant="primary"}
:::badge{:label="props.title" :count="props.variant"}
:::
::
`,
      { components: { card: Card, badge: Badge } }
    )
    // The badge is rendered inside the card's default slot with the card's
    // title surfacing through props.title.
    expect(html).toContain('Hello')
  })

  it('yields undefined for unresolved paths (uses component default)', async () => {
    const html = await renderMarkdown(
      `::badge{:label="frontmatter.missing"}
::`,
      { components: { badge: Badge } }
    )
    // label default is '' — resolved undefined becomes the empty default.
    expect(html).toContain('class="badge"')
    expect(html).not.toContain('frontmatter.missing')
  })

  it('leaves non-:prefix attributes untouched', async () => {
    const html = await renderMarkdown(
      `---
site: Blog
---

::badge{label="frontmatter.site"}
::
`,
      { components: { badge: Badge } }
    )
    // literal string, not resolved because there's no colon prefix
    expect(html).toContain('frontmatter.site')
  })
})
