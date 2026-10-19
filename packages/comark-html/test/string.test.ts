import { describe, it, expect } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderHtmlFromDocument } from '../src/index'
import binding from '../src/plugins/binding'

describe('renderHtmlFromDocument', () => {
  it('renders without options (backward compatible)', async () => {
    const doc = await parseMarkdown('# Hello **World**')
    const html = await renderHtmlFromDocument(doc)
    expect(html).toContain('<h1')
    expect(html).toContain('<strong>World</strong>')
  })

  it('renders custom component with render', async () => {
    const doc = await parseMarkdown('::alert{type="info"}\nHello!\n::')
    const html = await renderHtmlFromDocument(doc, {
      components: {
        alert: async ([_tag, attrs, ...children], { render }) => {
          return `<div class="alert alert-${attrs.type}">${await render(children)}</div>`
        },
      },
    })
    expect(html).toContain('<div class="alert alert-info">')
    expect(html).toContain('Hello!')
    expect(html).toContain('</div>')
    expect(html).not.toContain('<alert')
  })

  it('passes data to component renderers', async () => {
    const doc = await parseMarkdown('::banner\nContent\n::')
    const html = await renderHtmlFromDocument(doc, {
      data: { siteName: 'My Site' },
      components: {
        banner: async ([_tag, _attrs, ...children], { render, data }) => {
          return `<header><span>${data?.siteName}</span>${await render(children)}</header>`
        },
      },
    })
    expect(html).toContain('<span>My Site</span>')
    expect(html).toContain('Content')
  })

  it('renders component attributes/props', async () => {
    const doc = await parseMarkdown('::card{title="Welcome" theme="dark"}\nBody\n::')
    const html = await renderHtmlFromDocument(doc, {
      components: {
        card: async ([_tag, attrs, ...children], { render }) => {
          return `<section data-title="${attrs.title}" data-theme="${attrs.theme}">${await render(children)}</section>`
        },
      },
    })
    expect(html).toContain('data-title="Welcome"')
    expect(html).toContain('data-theme="dark"')
    expect(html).toContain('Body')
  })

  it('renders nested custom components', async () => {
    const doc = await parseMarkdown('::outer\n:::inner\nDeep content\n:::\n::')
    const html = await renderHtmlFromDocument(doc, {
      components: {
        outer: async ([_tag, _attrs, ...children], { render }) => {
          return `<div class="outer">${await render(children)}</div>`
        },
        inner: async ([_tag, _attrs, ...children], { render }) => {
          return `<div class="inner">${await render(children)}</div>`
        },
      },
    })
    expect(html).toContain('<div class="outer">')
    expect(html).toContain('<div class="inner">')
    expect(html).toContain('Deep content')
  })

  it('renders components inside components with mixed HTML', async () => {
    const doc = await parseMarkdown(`
::layout{theme="dark"}
# Page Title

:::card{title="First"}
Some **bold** text

::::alert{type="info"}
Nested alert inside card
::::
:::

:::card{title="Second"}
More content
:::
::
`)
    const html = await renderHtmlFromDocument(doc, {
      components: {
        layout: async ([_tag, attrs, ...children], { render }) => {
          return `<div class="layout" data-theme="${attrs.theme}">${await render(children)}</div>`
        },
        card: async ([_tag, attrs, ...children], { render }) => {
          return `<article class="card"><h2>${attrs.title}</h2>${await render(children)}</article>`
        },
        alert: async ([_tag, attrs, ...children], { render }) => {
          return `<div class="alert alert-${attrs.type}" role="alert">${await render(children)}</div>`
        },
      },
    })

    expect(html).toContain('<div class="layout" data-theme="dark">')
    expect(html).toContain('<article class="card"><h2>First</h2>')
    expect(html).toContain('<article class="card"><h2>Second</h2>')
    expect(html).toContain('<div class="alert alert-info" role="alert">')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('Nested alert inside card')
    expect(html).toContain('More content')
    expect(html).not.toContain('<layout')
    expect(html).not.toContain('<card')
    expect(html).not.toContain('<alert')
  })

  it('leaves standard HTML elements unchanged when components are provided', async () => {
    const doc = await parseMarkdown('# Title\n\n::alert{type="warning"}\nMessage\n::')
    const html = await renderHtmlFromDocument(doc, {
      components: {
        alert: async ([_tag, attrs, ...children], { render }) => {
          return `<div class="alert-${attrs.type}">${await render(children)}</div>`
        },
      },
    })
    expect(html).toContain('<h1')
    expect(html).toContain('Title')
    expect(html).toContain('<div class="alert-warning">')
    expect(html).toContain('Message')
  })

  it('renders conditional component handler', async () => {
    const doc = await parseMarkdown(
      '::alert{type="info"}\nInfo message\n::\n\n::alert{type="warning"}\nWarning message\n::'
    )
    const html = await renderHtmlFromDocument(doc, {
      components: {
        infoAlert: {
          match: (node) => node[0] === 'alert' && node[1].type === 'info',
          handler: async ([_tag, _attrs, ...children], { render }) => {
            return `<div class="info-box">${await render(children)}</div>`
          },
        },
      },
    })

    expect(html).toContain('<div class="info-box">')
    expect(html).toContain('Info message')
  })

  describe('data binding', () => {
    it('resolves :prop bindings from frontmatter', async () => {
      const doc = await parseMarkdown(`---
siteName: My Blog
user:
  name: Ada
---

::alert{:title="frontmatter.siteName" type="info"}
Hello :badge{:label="frontmatter.user.name"}!
::
`)
      const html = await renderHtmlFromDocument(doc)
      expect(html).toContain('title="My Blog"')
      expect(html).toContain('label="Ada"')
    })

    it('resolves :prop bindings from the data option', async () => {
      const doc = await parseMarkdown('::alert{:title="data.headline"}\nHi\n::')
      const html = await renderHtmlFromDocument(doc, { data: { headline: 'Release notes' } })
      expect(html).toContain('title="Release notes"')
    })

    it('resolves :prop bindings from meta', async () => {
      const doc = await parseMarkdown('::alert{:title="meta.wordCount"}\nHi\n::')
      doc.meta = { wordCount: 42 }
      const html = await renderHtmlFromDocument(doc)
      expect(html).toContain('title="42"')
    })

    it("exposes the enclosing component's props to nested bindings", async () => {
      const doc = await parseMarkdown(`::card{title="Hello" variant="primary"}
:::badge{:color="props.variant" :text="props.title"}
:::
::
`)
      const html = await renderHtmlFromDocument(doc)
      expect(html).toContain('color="primary"')
      expect(html).toContain('text="Hello"')
    })

    it('preserves unresolved paths as literal string attributes', async () => {
      const doc = await parseMarkdown('::card{:to="$doc.snippet.link"}\n::')
      const html = await renderHtmlFromDocument(doc)
      expect(html).toContain('to="$doc.snippet.link"')
    })

    it('leaves attributes without :prefix untouched', async () => {
      const doc = await parseMarkdown(`---
name: Ada
---

::card{title="frontmatter.name"}
::
`)
      const html = await renderHtmlFromDocument(doc)
      expect(html).toContain('title="frontmatter.name"')
    })

    it('interpolates `{{ path }}` placeholders inside :prefixed props', async () => {
      const doc = await parseMarkdown('Go: :a[Read more]{:href="/docs/{{ data.slug }}/overview"}', {
        plugins: [binding()],
      })
      const html = await renderHtmlFromDocument(doc, { data: { slug: 'getting-started' } })
      expect(html).toContain('<a href="/docs/getting-started/overview">')
    })

    it('interpolates placeholders in block YAML props', async () => {
      const doc = await parseMarkdown('::card\n---\n:title: Item {{ data.id }}\n---\nBody\n::', {
        plugins: [binding()],
      })
      const html = await renderHtmlFromDocument(doc, { data: { id: 7 } })
      expect(html).toContain('title="Item 7"')
    })

    it('renders a link without href when the interpolated URL is unsafe', async () => {
      const doc = await parseMarkdown(':a[x]{:href="{{ data.url }}"}', { plugins: [binding()] })
      const bad = await renderHtmlFromDocument(doc, { data: { url: 'javascript:alert(1)' } })
      expect(bad).toBe('<a>x</a>')
      const ok = await renderHtmlFromDocument(doc, { data: { url: '/ok' } })
      expect(ok).toBe('<a href="/ok">x</a>')
    })

    it('escapes interpolated values', async () => {
      const doc = await parseMarkdown(':card{:title="T {{ data.t }}"}', { plugins: [binding()] })
      const html = await renderHtmlFromDocument(doc, { data: { t: 'a"b<c' } })
      expect(html).toContain('title="T a&quot;b&lt;c"')
      expect(html).not.toContain('a"b<c')
    })
  })
})
