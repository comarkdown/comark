import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { parse } from 'comark'
import ComarkRenderer from '../src/components/ComarkRenderer.svelte'
import ComarkNode from '../src/components/ComarkNode.svelte'
import Alert from './test-components/Alert.svelte'
import ProseH1 from './test-components/ProseH1.svelte'

describe('ComarkNode', () => {
  it('renders a paragraph', async () => {
    const tree = await parse('Hello world')
    const screen = render(ComarkNode, { node: tree.nodes[0] })
    await expect.element(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders nested inline markup', async () => {
    const tree = await parse('Hello **World**')
    const screen = render(ComarkNode, { node: tree.nodes[0] })
    await expect.element(screen.getByText('Hello World')).toBeInTheDocument()
    await expect.element(screen.getByText('World')).toBeInTheDocument()
  })

  it('renders a link with href', async () => {
    const tree = await parse('[link](/about)')
    const screen = render(ComarkNode, { node: tree.nodes[0] })
    await expect
      .element(screen.getByRole('link', { name: 'link' }))
      .toHaveAttribute('href', '/about')
  })

  it('maps className to class', async () => {
    const screen = render(ComarkNode, {
      node: ['div', { className: 'my-class' }, 'content'],
    })
    const div = screen.container.querySelector<HTMLElement>('.my-class')!
    expect(div).not.toBeNull()
    await expect.element(div).toHaveTextContent('content')
  })

  it('renders caret with custom class', async () => {
    const screen = render(ComarkNode, {
      node: 'text',
      caretClass: 'test-caret',
    })
    const caret = screen.container.querySelector<HTMLElement>('.test-caret')!
    expect(caret).not.toBeNull()
    await expect.element(caret).toHaveStyle({ display: 'inline-block' })
  })

  it('does not render caret when caretClass is null', async () => {
    const screen = render(ComarkNode, {
      node: 'text',
      caretClass: null,
    })
    expect(screen.container.querySelector('span')).toBeNull()
  })

  it('threads caret to deepest last text node', async () => {
    const tree = await parse('first **last**')
    const screen = render(ComarkNode, {
      node: tree.nodes[0],
      caretClass: 'caret',
    })
    const strong = screen.container.querySelector<HTMLElement>('strong')!
    expect(strong.querySelector('.caret')).not.toBeNull()
    expect(screen.container.querySelectorAll('.caret').length).toBe(1)
  })
})

describe('ComarkRenderer', () => {
  it('renders a heading with inline markup', async () => {
    const tree = await parse('# Hello **World**')
    const screen = render(ComarkRenderer, { tree })
    const heading = screen.getByRole('heading', {
      name: 'Hello World',
      level: 1,
    })
    await expect.element(heading).toBeInTheDocument()
    await expect.element(heading).toHaveAttribute('id', 'hello-strong-world')
  })

  it('renders multiple block elements', async () => {
    const tree = await parse('# Heading\n\nA paragraph\n\n- item 1\n- item 2')
    const screen = render(ComarkRenderer, { tree })

    await expect
      .element(screen.getByRole('heading', { name: 'Heading', level: 1 }))
      .toBeInTheDocument()
    await expect.element(screen.getByText('A paragraph')).toBeInTheDocument()

    const items = screen.getByRole('listitem')
    expect(items.elements().length).toBe(2)
    await expect.element(items.nth(0)).toHaveTextContent('item 1')
    await expect.element(items.nth(1)).toHaveTextContent('item 2')
  })

  it('renders empty tree as empty wrapper', async () => {
    const tree = { nodes: [], frontmatter: {}, meta: {} }
    const screen = render(ComarkRenderer, { tree })
    const wrapper
      = screen.container.querySelector<HTMLElement>('.comark-content')!
    expect(wrapper).not.toBeNull()
    expect(wrapper.children.length).toBe(0)
  })

  it('applies custom class to wrapper', async () => {
    const tree = await parse('hello')
    const screen = render(ComarkRenderer, { tree, class: 'prose' })
    const wrapper
      = screen.container.querySelector<HTMLElement>('.comark-content')!
    await expect.element(wrapper).toHaveClass('prose')
  })

  it('renders inline code', async () => {
    const tree = await parse('use `const x = 1`')
    const screen = render(ComarkRenderer, { tree })
    await expect.element(screen.getByText('const x = 1')).toBeInTheDocument()
  })

  it('renders links with href', async () => {
    const tree = await parse('[click](https://example.com)')
    const screen = render(ComarkRenderer, { tree })
    await expect
      .element(screen.getByRole('link', { name: 'click' }))
      .toHaveAttribute('href', 'https://example.com')
  })

  it('renders images with src and alt', async () => {
    const tree = await parse('![alt text](image.png)')
    const screen = render(ComarkRenderer, { tree })
    await expect
      .element(screen.getByAltText('alt text'))
      .toHaveAttribute('src', 'image.png')
  })

  it('renders blockquotes', async () => {
    const tree = await parse('> quoted text')
    const screen = render(ComarkRenderer, { tree })
    expect(screen.container.querySelector('blockquote')).not.toBeNull()
    await expect.element(screen.getByText('quoted text')).toBeInTheDocument()
  })

  it('renders emphasis and strong', async () => {
    const tree = await parse('*em* and **strong**')
    const screen = render(ComarkRenderer, { tree })
    await expect.element(screen.getByText('em')).toBeInTheDocument()
    await expect.element(screen.getByText('strong')).toBeInTheDocument()
  })
})

describe('custom components', () => {
  it('resolves custom component for MDC syntax', async () => {
    const tree = await parse('::alert{type="warning"}\nWatch out!\n::')
    const screen = render(ComarkRenderer, {
      tree,
      components: { alert: Alert },
    })
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Watch out!')
    await expect.element(screen.getByRole('alert')).toHaveClass('alert-warning')
  })

  it('resolves component by PascalCase key', async () => {
    const tree = await parse('::alert{type="info"}\nInfo message\n::')
    const screen = render(ComarkRenderer, { tree, components: { Alert } })
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Info message')
    await expect.element(screen.getByRole('alert')).toHaveClass('alert-info')
  })

  it('resolves Prose-prefixed component for native tags', async () => {
    const tree = await parse('# Custom Heading')
    const screen = render(ComarkRenderer, { tree, components: { ProseH1 } })
    await expect
      .element(
        screen.getByRole('heading', { name: 'Custom Heading', level: 1 }),
      )
      .toHaveClass('prose-heading')
  })

  it('renders children inside custom components', async () => {
    const tree = await parse('::alert{type="info"}\n**Bold** text\n::')
    const screen = render(ComarkRenderer, {
      tree,
      components: { alert: Alert },
    })
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Bold text')
    await expect.element(screen.getByRole('alert')).toHaveClass('alert-info')
  })

  it('falls back to native element when no component matches', async () => {
    const tree = await parse('::alert{type="info"}\ncontent\n::')
    const screen = render(ComarkRenderer, { tree, components: {} })
    const alert = screen.container.querySelector<HTMLElement>('alert')!
    expect(alert).not.toBeNull()
    await expect.element(alert).toHaveTextContent('content')
  })
})
