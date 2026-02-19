import { describe, it, expect } from 'vitest'
import { parse } from '../src/index'
import { renderHTML } from '../src/string'

describe('renderHTML', () => {
  it('renders without options (backward compatible)', async () => {
    const tree = await parse('# Hello **World**')
    const html = renderHTML(tree)
    expect(html).toContain('<h1')
    expect(html).toContain('<strong>World</strong>')
  })

  it('renders custom component with render', async () => {
    const tree = await parse('::alert{type="info"}\nHello!\n::')
    const html = renderHTML(tree, {
      components: {
        alert: ([_tag, attrs, ...children], { render }) => {
          return `<div class="alert alert-${attrs.type}">${render(children)}</div>`
        },
      },
    })
    expect(html).toContain('<div class="alert alert-info">')
    expect(html).toContain('Hello!')
    expect(html).toContain('</div>')
    expect(html).not.toContain('<alert')
  })

  it('passes data to component renderers', async () => {
    const tree = await parse('::banner\nContent\n::')
    const html = renderHTML(tree, {
      data: { siteName: 'My Site' },
      components: {
        banner: ([_tag, _attrs, ...children], { render, data }) => {
          return `<header><span>${data?.siteName}</span>${render(children)}</header>`
        },
      },
    })
    expect(html).toContain('<span>My Site</span>')
    expect(html).toContain('Content')
  })

  it('renders component attributes/props', async () => {
    const tree = await parse('::card{title="Welcome" theme="dark"}\nBody\n::')
    const html = renderHTML(tree, {
      components: {
        card: ([_tag, attrs, ...children], { render }) => {
          return `<section data-title="${attrs.title}" data-theme="${attrs.theme}">${render(children)}</section>`
        },
      },
    })
    expect(html).toContain('data-title="Welcome"')
    expect(html).toContain('data-theme="dark"')
    expect(html).toContain('Body')
  })

  it('renders nested custom components', async () => {
    const tree = await parse('::outer\n:::inner\nDeep content\n:::\n::')
    const html = renderHTML(tree, {
      components: {
        outer: ([_tag, _attrs, ...children], { render }) => {
          return `<div class="outer">${render(children)}</div>`
        },
        inner: ([_tag, _attrs, ...children], { render }) => {
          return `<div class="inner">${render(children)}</div>`
        },
      },
    })
    expect(html).toContain('<div class="outer">')
    expect(html).toContain('<div class="inner">')
    expect(html).toContain('Deep content')
  })

  it('renders components inside components with mixed HTML', async () => {
    const tree = await parse(`
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
    const html = renderHTML(tree, {
      components: {
        layout: ([_tag, attrs, ...children], { render }) => {
          return `<div class="layout" data-theme="${attrs.theme}">${render(children)}</div>`
        },
        card: ([_tag, attrs, ...children], { render }) => {
          return `<article class="card"><h2>${attrs.title}</h2>${render(children)}</article>`
        },
        alert: ([_tag, attrs, ...children], { render }) => {
          return `<div class="alert alert-${attrs.type}" role="alert">${render(children)}</div>`
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
    const tree = await parse('# Title\n\n::alert{type="warning"}\nMessage\n::')
    const html = renderHTML(tree, {
      components: {
        alert: ([_tag, attrs, ...children], { render }) => {
          return `<div class="alert-${attrs.type}">${render(children)}</div>`
        },
      },
    })
    expect(html).toContain('<h1')
    expect(html).toContain('Title')
    expect(html).toContain('<div class="alert-warning">')
    expect(html).toContain('Message')
  })
})
