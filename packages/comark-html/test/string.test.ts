import { describe, it, expect } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderHtml } from '../src/index'

describe('renderHtml', () => {
  it('renders without options (backward compatible)', async () => {
    const tree = await parseMarkdown('# Hello **World**')
    const html = await renderHtml(tree)
    expect(html).toContain('<h1')
    expect(html).toContain('<strong>World</strong>')
  })

  it('renders custom component with render', async () => {
    const tree = await parseMarkdown('::alert{type="info"}\nHello!\n::')
    const html = await renderHtml(tree, {
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
    const tree = await parseMarkdown('::banner\nContent\n::')
    const html = await renderHtml(tree, {
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
    const tree = await parseMarkdown('::card{title="Welcome" theme="dark"}\nBody\n::')
    const html = await renderHtml(tree, {
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
    const tree = await parseMarkdown('::outer\n:::inner\nDeep content\n:::\n::')
    const html = await renderHtml(tree, {
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
    const tree = await parseMarkdown(`
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
    const html = await renderHtml(tree, {
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
    const tree = await parseMarkdown('# Title\n\n::alert{type="warning"}\nMessage\n::')
    const html = await renderHtml(tree, {
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
    const tree = await parseMarkdown(
      '::alert{type="info"}\nInfo message\n::\n\n::alert{type="warning"}\nWarning message\n::'
    )
    const html = await renderHtml(tree, {
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
      const tree = await parseMarkdown(`---
siteName: My Blog
user:
  name: Ada
---

::alert{:title="frontmatter.siteName" type="info"}
Hello :badge{:label="frontmatter.user.name"}!
::
`)
      const html = await renderHtml(tree)
      expect(html).toContain('title="My Blog"')
      expect(html).toContain('label="Ada"')
    })

    it('resolves :prop bindings from the data option', async () => {
      const tree = await parseMarkdown('::alert{:title="data.headline"}\nHi\n::')
      const html = await renderHtml(tree, { data: { headline: 'Release notes' } })
      expect(html).toContain('title="Release notes"')
    })

    it('resolves :prop bindings from meta', async () => {
      const tree = await parseMarkdown('::alert{:title="meta.wordCount"}\nHi\n::')
      tree.meta = { wordCount: 42 }
      const html = await renderHtml(tree)
      expect(html).toContain('title="42"')
    })

    it("exposes the enclosing component's props to nested bindings", async () => {
      const tree = await parseMarkdown(`::card{title="Hello" variant="primary"}
:::badge{:color="props.variant" :text="props.title"}
:::
::
`)
      const html = await renderHtml(tree)
      expect(html).toContain('color="primary"')
      expect(html).toContain('text="Hello"')
    })

    it('preserves unresolved paths as literal string attributes', async () => {
      const tree = await parseMarkdown('::card{:to="$doc.snippet.link"}\n::')
      const html = await renderHtml(tree)
      expect(html).toContain('to="$doc.snippet.link"')
    })

    it('leaves attributes without :prefix untouched', async () => {
      const tree = await parseMarkdown(`---
name: Ada
---

::card{title="frontmatter.name"}
::
`)
      const html = await renderHtml(tree)
      expect(html).toContain('title="frontmatter.name"')
    })
  })
})
