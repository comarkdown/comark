import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { parse } from 'comark'
import { ComarkRenderer } from '../src/components/ComarkRenderer'

interface BadgeProps {
  label?: string
  count?: number
  config?: Record<string, unknown>
}

function Badge({ label = '', count = 0, config = {} }: BadgeProps) {
  return (
    <span
      className="badge"
      data-count={count}
    >
      {label}
      {Object.keys(config).length > 0 ? JSON.stringify(config) : null}
    </span>
  )
}

interface CardProps {
  title?: string
  variant?: string
  children?: React.ReactNode
}

function Card({ title = '', variant = '', children }: CardProps) {
  return (
    <div className={`card card-${variant}`}>
      <h3>{title}</h3>
      <div className="body">{children}</div>
    </div>
  )
}

async function renderMarkdown(markdown: string, props: Record<string, any> = {}) {
  const tree = await parse(markdown)
  return renderToString(
    <ComarkRenderer
      tree={tree}
      {...props}
    />
  )
}

describe('ComarkRenderer — data binding', () => {
  it('resolves :prefix bindings from frontmatter onto component props', async () => {
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
:::badge{:label="props.title"}
:::
::
`,
      { components: { card: Card, badge: Badge } }
    )
    expect(html).toContain('class="card card-primary"')
    expect(html).toContain('Hello')
  })

  it('yields undefined for unresolved paths (component uses its default)', async () => {
    const html = await renderMarkdown(
      `::badge{:label="frontmatter.missing"}
::`,
      { components: { badge: Badge } }
    )
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
    expect(html).toContain('frontmatter.site')
  })
})
