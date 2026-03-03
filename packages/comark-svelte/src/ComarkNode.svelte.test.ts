/// <reference types="vitest/browser" />
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parse } from 'comark'
import ComarkRenderer from './ComarkRenderer.svelte'
import ComarkNode from './ComarkNode.svelte'

describe('ComarkNode', () => {
  it('renders a text node', async () => {
    const { container } = render(ComarkNode, { node: 'Hello world' })
    await expect.element(container).toHaveTextContent('Hello world')
  })

  it('renders a paragraph element with correct text', async () => {
    const { container } = render(ComarkNode, {
      node: ['p', {}, 'A paragraph'],
    })
    const p = container.querySelector('p')!
    expect(p).not.toBeNull()
    await expect.element(p).toHaveTextContent('A paragraph')
  })

  it('renders nested elements with correct structure', async () => {
    const { container } = render(ComarkNode, {
      node: ['p', {}, 'Hello ', ['strong', {}, 'World']],
    })
    const p = container.querySelector('p')!
    expect(p).not.toBeNull()
    await expect.element(p).toHaveTextContent('Hello World')

    const strong = p.querySelector('strong')!
    expect(strong).not.toBeNull()
    await expect.element(strong).toHaveTextContent('World')
  })

  it('maps className to class attribute', async () => {
    const { container } = render(ComarkNode, {
      node: ['div', { className: 'my-class' }, 'content'],
    })
    const div = container.querySelector('div')!
    expect(div).not.toBeNull()
    await expect.element(div).toHaveClass('my-class')
    await expect.element(div).toHaveTextContent('content')
  })

  it('renders HTML attributes correctly', async () => {
    const { container } = render(ComarkNode, {
      node: ['a', { href: '/about', target: '_blank' }, 'link'],
    })
    const a = container.querySelector('a')!
    expect(a).not.toBeNull()
    await expect.element(a).toHaveAttribute('href', '/about')
    await expect.element(a).toHaveAttribute('target', '_blank')
    await expect.element(a).toHaveTextContent('link')
  })

  it('renders caret span with custom class', async () => {
    const { container } = render(ComarkNode, {
      node: 'text',
      caretClass: 'test-caret',
    })
    const caret = container.querySelector('span.test-caret')!
    expect(caret).not.toBeNull()
    await expect.element(caret).toHaveStyle({ display: 'inline-block' })
  })

  it('does not render caret when caretClass is null', async () => {
    const { container } = render(ComarkNode, {
      node: 'text',
      caretClass: null,
    })
    expect(container.querySelector('span')).toBeNull()
    await expect.element(container).toHaveTextContent('text')
  })

  it('threads caret to deepest last text node', async () => {
    const { container } = render(ComarkNode, {
      node: ['p', {}, 'first ', ['strong', {}, 'last']],
      caretClass: 'caret',
    })
    // Caret should be inside <strong>, not outside it
    const strong = container.querySelector('strong')!
    const caret = strong.querySelector('span.caret')!
    expect(caret).not.toBeNull()

    // Only one caret in the entire tree
    expect(container.querySelectorAll('span.caret').length).toBe(1)
  })
})

describe('ComarkRenderer', () => {
  it('renders a heading with inline markup', async () => {
    const tree = await parse('# Hello **World**')
    const { container } = render(ComarkRenderer, { tree })

    const wrapper = container.querySelector('div.comark-content')!
    expect(wrapper).not.toBeNull()

    const h1 = wrapper.querySelector('h1')!
    expect(h1).not.toBeNull()
    await expect.element(h1).toHaveAttribute('id', 'hello-strong-world')
    await expect.element(h1).toHaveTextContent('Hello World')

    const strong = h1.querySelector('strong')!
    expect(strong).not.toBeNull()
    await expect.element(strong).toHaveTextContent('World')
  })

  it('renders multiple block elements with correct content', async () => {
    const tree = await parse('# Heading\n\nA paragraph\n\n- item 1\n- item 2')
    const { container } = render(ComarkRenderer, { tree })

    const h1 = container.querySelector('h1')!
    expect(h1).not.toBeNull()
    await expect.element(h1).toHaveTextContent('Heading')

    const p = container.querySelector('p')!
    await expect.element(p).toHaveTextContent('A paragraph')

    const items = container.querySelectorAll('li')
    expect(items.length).toBe(2)
    await expect.element(items[0]).toHaveTextContent('item 1')
    await expect.element(items[1]).toHaveTextContent('item 2')
  })

  it('renders empty tree as empty wrapper', async () => {
    const tree = { nodes: [], frontmatter: {}, meta: {} }
    const { container } = render(ComarkRenderer, { tree })
    const wrapper = container.querySelector('div.comark-content')!
    expect(wrapper).not.toBeNull()
    expect(wrapper.children.length).toBe(0)
  })

  it('applies custom class to wrapper', async () => {
    const tree = await parse('hello')
    const { container } = render(ComarkRenderer, { tree, class: 'prose' })
    const wrapper = container.querySelector('div.comark-content')!
    expect(wrapper).not.toBeNull()
    await expect.element(wrapper).toHaveClass('prose')
  })

  it('renders inline code', async () => {
    const tree = await parse('use `const x = 1`')
    const { container } = render(ComarkRenderer, { tree })
    const code = container.querySelector('code')!
    expect(code).not.toBeNull()
    await expect.element(code).toHaveTextContent('const x = 1')
  })

  it('renders links with href', async () => {
    const tree = await parse('[click](https://example.com)')
    const { container } = render(ComarkRenderer, { tree })
    const a = container.querySelector('a')!
    expect(a).not.toBeNull()
    await expect.element(a).toHaveAttribute('href', 'https://example.com')
    await expect.element(a).toHaveTextContent('click')
  })

  it('renders images with src and alt', async () => {
    const tree = await parse('![alt](image.png)')
    const { container } = render(ComarkRenderer, { tree })
    const img = container.querySelector('img')!
    expect(img).not.toBeNull()
    await expect.element(img).toHaveAttribute('src', 'image.png')
    await expect.element(img).toHaveAttribute('alt', 'alt')
  })
})
