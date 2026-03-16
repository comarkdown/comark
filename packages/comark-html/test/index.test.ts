import { describe, it, expect } from 'vitest'
import { parse } from 'comark'
import { render, createRender, renderHTML } from '../src/index'

describe('render', () => {
  it('converts markdown to html', async () => {
    const html = await render('# Hello\n\nThis is **bold**.')
    expect(html).toContain('<h1')
    expect(html).toContain('Hello')
    expect(html).toContain('<strong>bold</strong>')
  })

  it('handles inline formatting', async () => {
    const html = await render('_italic_ and `code`')
    expect(html).toContain('<em>italic</em>')
    expect(html).toContain('<code>code</code>')
  })

  it('handles lists', async () => {
    const html = await render('- Item 1\n- Item 2\n- Item 3')
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>Item 1</li>')
    expect(html).toContain('<li>Item 2</li>')
  })

  it('handles blockquotes', async () => {
    const html = await render('> This is a quote')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('This is a quote')
  })

  it('handles links', async () => {
    const html = await render('[comark](https://comark.dev)')
    expect(html).toContain('<a href="https://comark.dev">')
    expect(html).toContain('comark')
  })

  it('handles code blocks', async () => {
    const html = await render('```js\nconsole.log("hi")\n```')
    expect(html).toContain('<pre')
    expect(html).toContain('<code')
    expect(html).toContain('console.log')
  })

  it('handles tables', async () => {
    const html = await render('| A | B |\n|---|---|\n| 1 | 2 |')
    expect(html).toContain('<table>')
    expect(html).toContain('<th>')
    expect(html).toContain('<td>')
  })

  it('accepts render options with custom components', async () => {
    const html = await render('::note\nHello!\n::', {
      render: {
        components: {
          note: ([, , ...children], { render }) =>
            `<aside>${render(children)}</aside>`,
        },
      },
    })
    expect(html).toContain('<aside>')
    expect(html).toContain('Hello!')
    expect(html).not.toContain('<note')
  })

  it('strips frontmatter from output', async () => {
    const html = await render('---\ntitle: Test\n---\n\n# Content')
    expect(html).not.toContain('title:')
    expect(html).not.toContain('---')
    expect(html).toContain('<h1')
  })
})

describe('createRender', () => {
  it('returns a reusable render function', async () => {
    const renderFn = createRender()
    const html1 = await renderFn('# Doc 1')
    const html2 = await renderFn('# Doc 2')
    expect(html1).toContain('Doc 1')
    expect(html2).toContain('Doc 2')
  })

  it('reuses parser options across calls', async () => {
    const renderFn = createRender({
      render: {
        components: {
          badge: ([, attrs]) =>
            `<span class="badge badge-${attrs.type}">${attrs.label}</span>`,
        },
      },
    })

    const html1 = await renderFn('::badge{type="info" label="New"}\n::')
    const html2 = await renderFn('::badge{type="warning" label="Deprecated"}\n::')

    expect(html1).toContain('<span class="badge badge-info">New</span>')
    expect(html2).toContain('<span class="badge badge-warning">Deprecated</span>')
  })

  it('passes data to component renderers', async () => {
    const renderFn = createRender({
      render: {
        data: { version: '2.0' },
        components: {
          version: ([,, ...children], { render, data }) =>
            `<span data-v="${data?.version}">${render(children)}</span>`,
        },
      },
    })

    const html = await renderFn('::version\ncurrent\n::')
    expect(html).toContain('data-v="2.0"')
    expect(html).toContain('current')
  })

  it('accepts parse options', async () => {
    const renderFn = createRender({
      parse: { autoUnwrap: true },
    })
    const html = await renderFn('Just text')
    // autoUnwrap removes <p> wrapper from single-inline content in components
    expect(html).toBeTruthy()
  })
})

describe('renderHTML', () => {
  it('renders a pre-parsed tree', async () => {
    const tree = await parse('# Title\n\n**Bold** text.')
    const html = renderHTML(tree)
    expect(html).toContain('<h1')
    expect(html).toContain('Title')
    expect(html).toContain('<strong>Bold</strong>')
  })

  it('renders without options', async () => {
    const tree = await parse('Hello _world_')
    const html = renderHTML(tree)
    expect(html).toContain('<em>world</em>')
  })

  it('renders custom components', async () => {
    const tree = await parse('::alert{type="warning"}\nWatch out!\n::')
    const html = renderHTML(tree, {
      components: {
        alert: ([, attrs, ...children], { render }) =>
          `<div role="alert" class="alert-${attrs.type}">${render(children)}</div>`,
      },
    })
    expect(html).toContain('role="alert"')
    expect(html).toContain('class="alert-warning"')
    expect(html).toContain('Watch out!')
    expect(html).not.toContain('<alert')
  })

  it('passes data to component renderers', async () => {
    const tree = await parse('::header\nWelcome\n::')
    const html = renderHTML(tree, {
      data: { siteName: 'My Blog' },
      components: {
        header: ([,, ...children], { render, data }) =>
          `<header><h1>${data?.siteName}</h1>${render(children)}</header>`,
      },
    })
    expect(html).toContain('<h1>My Blog</h1>')
    expect(html).toContain('Welcome')
  })

  it('renders nested components', async () => {
    const tree = await parse('::outer\n:::inner\nDeep\n:::\n::')
    const html = renderHTML(tree, {
      components: {
        outer: ([,, ...children], { render }) => `<div class="outer">${render(children)}</div>`,
        inner: ([,, ...children], { render }) => `<div class="inner">${render(children)}</div>`,
      },
    })
    expect(html).toContain('<div class="outer">')
    expect(html).toContain('<div class="inner">')
    expect(html).toContain('Deep')
  })

  it('leaves unknown components as-is when no renderer provided', async () => {
    const tree = await parse('::custom\nContent\n::')
    const html = renderHTML(tree)
    expect(html).toContain('Content')
  })

  it('handles inline HTML elements', async () => {
    const tree = await parse('Text with <strong class="highlight">HTML</strong>')
    const html = renderHTML(tree)
    expect(html).toContain('<strong class="highlight">HTML</strong>')
  })
})
