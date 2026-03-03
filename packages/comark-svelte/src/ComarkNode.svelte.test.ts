import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { page } from 'vitest/browser'
import { parse } from 'comark'
import ComarkRenderer from './ComarkRenderer.svelte'
import ComarkNode from './ComarkNode.svelte'
import Alert from './test-components/Alert.svelte'
import ProseH1 from './test-components/ProseH1.svelte'

describe('ComarkNode', () => {
  it('renders a paragraph', async () => {
    const tree = await parse('Hello world')
    render(ComarkNode, { node: tree.nodes[0] })
    await expect.element(page.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders nested inline markup', async () => {
    const tree = await parse('Hello **World**')
    render(ComarkNode, { node: tree.nodes[0] })
    await expect.element(page.getByText('Hello World')).toBeInTheDocument()
    await expect.element(page.getByText('World')).toBeInTheDocument()
  })

  it('renders a link with href', async () => {
    const tree = await parse('[link](/about)')
    render(ComarkNode, { node: tree.nodes[0] })
    const link = page.getByRole('link', { name: 'link' })
    await expect.element(link).toHaveAttribute('href', '/about')
  })

  it('maps className to class', async () => {
    const { container } = render(ComarkNode, {
      node: ['div', { className: 'my-class' }, 'content'],
    })
    const div = container.querySelector<HTMLElement>('.my-class')!
    expect(div).not.toBeNull()
    await expect.element(div).toHaveTextContent('content')
  })

  it('renders caret with custom class', async () => {
    const { container } = render(ComarkNode, {
      node: 'text',
      caretClass: 'test-caret',
    })
    const caret = container.querySelector<HTMLElement>('.test-caret')!
    expect(caret).not.toBeNull()
    await expect.element(caret).toHaveStyle({ display: 'inline-block' })
  })

  it('does not render caret when caretClass is null', async () => {
    const { container } = render(ComarkNode, {
      node: 'text',
      caretClass: null,
    })
    expect(container.querySelector('span')).toBeNull()
  })

  it('threads caret to deepest last text node', async () => {
    const tree = await parse('first **last**')
    const { container } = render(ComarkNode, {
      node: tree.nodes[0],
      caretClass: 'caret',
    })
    // Caret should be inside <strong>, not outside it
    const strong = container.querySelector<HTMLElement>('strong')!
    expect(strong.querySelector('.caret')).not.toBeNull()
    expect(container.querySelectorAll('.caret').length).toBe(1)
  })
})

describe('ComarkRenderer', () => {
  it('renders a heading with inline markup', async () => {
    const tree = await parse('# Hello **World**')
    render(ComarkRenderer, { tree })
    const heading = page.getByRole('heading', { name: 'Hello World', level: 1 })
    await expect.element(heading).toBeInTheDocument()
    await expect.element(heading).toHaveAttribute('id', 'hello-strong-world')
  })

  it('renders multiple block elements', async () => {
    const tree = await parse('# Heading\n\nA paragraph\n\n- item 1\n- item 2')
    render(ComarkRenderer, { tree })

    await expect.element(page.getByRole('heading', { name: 'Heading', level: 1 })).toBeInTheDocument()
    await expect.element(page.getByText('A paragraph')).toBeInTheDocument()

    const items = page.getByRole('listitem')
    expect(items.elements().length).toBe(2)
    await expect.element(items.nth(0)).toHaveTextContent('item 1')
    await expect.element(items.nth(1)).toHaveTextContent('item 2')
  })

  it('renders empty tree as empty wrapper', async () => {
    const tree = { nodes: [], frontmatter: {}, meta: {} }
    const { container } = render(ComarkRenderer, { tree })
    const wrapper = container.querySelector<HTMLElement>('.comark-content')!
    expect(wrapper).not.toBeNull()
    expect(wrapper.children.length).toBe(0)
  })

  it('applies custom class to wrapper', async () => {
    const tree = await parse('hello')
    const { container } = render(ComarkRenderer, { tree, class: 'prose' })
    const wrapper = container.querySelector<HTMLElement>('.comark-content')!
    await expect.element(wrapper).toHaveClass('prose')
  })

  it('renders inline code', async () => {
    const tree = await parse('use `const x = 1`')
    render(ComarkRenderer, { tree })
    await expect.element(page.getByText('const x = 1')).toBeInTheDocument()
  })

  it('renders links with href', async () => {
    const tree = await parse('[click](https://example.com)')
    render(ComarkRenderer, { tree })
    const link = page.getByRole('link', { name: 'click' })
    await expect.element(link).toHaveAttribute('href', 'https://example.com')
  })

  it('renders images with src and alt', async () => {
    const tree = await parse('![alt text](image.png)')
    render(ComarkRenderer, { tree })
    const img = page.getByAltText('alt text')
    await expect.element(img).toHaveAttribute('src', 'image.png')
  })

  it('renders blockquotes', async () => {
    const tree = await parse('> quoted text')
    const { container } = render(ComarkRenderer, { tree })
    expect(container.querySelector('blockquote')).not.toBeNull()
    await expect.element(page.getByText('quoted text')).toBeInTheDocument()
  })

  it('renders emphasis and strong', async () => {
    const tree = await parse('*em* and **strong**')
    render(ComarkRenderer, { tree })
    await expect.element(page.getByText('em')).toBeInTheDocument()
    await expect.element(page.getByText('strong')).toBeInTheDocument()
  })
})

describe('custom components', () => {
  it('resolves custom component for MDC syntax', async () => {
    const tree = await parse('::alert{type="warning"}\nWatch out!\n::')
    render(ComarkRenderer, { tree, components: { alert: Alert } })
    const alert = page.getByRole('alert')
    await expect.element(alert).toHaveTextContent('Watch out!')
    await expect.element(alert).toHaveClass('alert-warning')
  })

  it('resolves component by PascalCase key', async () => {
    const tree = await parse('::alert{type="info"}\nInfo message\n::')
    render(ComarkRenderer, { tree, components: { Alert } })
    const alert = page.getByRole('alert')
    await expect.element(alert).toHaveTextContent('Info message')
    await expect.element(alert).toHaveClass('alert-info')
  })

  it('resolves Prose-prefixed component for native tags', async () => {
    const tree = await parse('# Custom Heading')
    render(ComarkRenderer, { tree, components: { ProseH1 } })
    const heading = page.getByRole('heading', { name: 'Custom Heading', level: 1 })
    await expect.element(heading).toHaveClass('prose-heading')
  })

  it('renders children inside custom components', async () => {
    const tree = await parse('::alert{type="info"}\n**Bold** text\n::')
    render(ComarkRenderer, { tree, components: { alert: Alert } })
    const alert = page.getByRole('alert')
    await expect.element(alert).toHaveTextContent('Bold text')
    await expect.element(alert).toHaveClass('alert-info')
  })

  it('falls back to native element when no component matches', async () => {
    const tree = await parse('::alert{type="info"}\ncontent\n::')
    const { container } = render(ComarkRenderer, { tree, components: {} })
    const alert = container.querySelector<HTMLElement>('alert')!
    expect(alert).not.toBeNull()
    await expect.element(alert).toHaveTextContent('content')
  })
})
