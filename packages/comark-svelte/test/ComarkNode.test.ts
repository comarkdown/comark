import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parse } from 'comark'
import ComarkRenderer from '../src/components/ComarkRenderer.svelte'
import ComarkNode from '../src/components/ComarkNode.svelte'
import Alert from './test-components/Alert.svelte'
import ProseH1 from './test-components/ProseH1.svelte'

/** Strip Svelte SSR hydration comments from rendered HTML */
function html(body: string): string {
  return body.replace(/<!--[[\]\-\d!]*-->/g, '').replace(/<!---->/g, '')
}

const CARET_STYLE
  = 'background-color: currentColor; display: inline-block; margin-left: 0.25rem; margin-right: 0.25rem; animation: pulse 0.75s cubic-bezier(0.4,0,0.6,1) infinite;'

describe('ComarkNode', () => {
  it('renders a paragraph', async () => {
    const tree = await parse('A paragraph')
    const { body } = render(ComarkNode, { props: { node: tree.nodes[0] } })
    expect(html(body)).toBe('<p>A paragraph</p>')
  })

  it('renders nested inline markup', async () => {
    const tree = await parse('Hello **World**')
    const { body } = render(ComarkNode, { props: { node: tree.nodes[0] } })
    expect(html(body)).toBe('<p>Hello <strong>World</strong></p>')
  })

  it('renders mixed inline markup', async () => {
    const tree = await parse('one *two* three')
    const { body } = render(ComarkNode, { props: { node: tree.nodes[0] } })
    expect(html(body)).toBe('<p>one <em>two</em> three</p>')
  })

  it('renders a link with attributes', async () => {
    const tree = await parse('[link](/about)')
    const { body } = render(ComarkNode, { props: { node: tree.nodes[0] } })
    expect(html(body)).toBe('<p><a href="/about">link</a></p>')
  })

  it('renders a thematic break', async () => {
    const tree = await parse('---')
    const { body } = render(ComarkNode, { props: { node: tree.nodes[0] } })
    expect(html(body)).toBe('<hr>')
  })

  it('skips comment nodes (null tag)', () => {
    const { body } = render(ComarkNode, {
      props: { node: [null, {}, 'a comment'] },
    })
    expect(html(body)).toBe('')
  })

  it('maps className to class', () => {
    const { body } = render(ComarkNode, {
      props: { node: ['div', { className: 'my-class' }, 'content'] },
    })
    expect(html(body)).toBe('<div class="my-class">content</div>')
  })

  it('parses colon-prefixed props as values', () => {
    const { body } = render(ComarkNode, {
      props: { node: ['div', { ':hidden': 'true' }, 'content'] },
    })
    expect(html(body)).toBe('<div hidden="">content</div>')
  })

  it('parses colon-prefixed JSON values', () => {
    const { body } = render(ComarkNode, {
      props: { node: ['div', { ':data-count': '42' }, 'content'] },
    })
    expect(html(body)).toBe('<div data-count="42">content</div>')
  })

  it('does not render caret when caretClass is null', async () => {
    const tree = await parse('some text')
    const { body } = render(ComarkNode, {
      props: { node: tree.nodes[0], caretClass: null },
    })
    expect(html(body)).toBe('<p>some text</p>')
    expect(html(body)).not.toContain('<span')
  })

  it('renders caret with custom class on text node', () => {
    const { body } = render(ComarkNode, {
      props: { node: 'text', caretClass: 'my-caret' },
    })
    expect(html(body)).toBe(
      `text<span class="my-caret" style="${CARET_STYLE}">\u2009</span>`,
    )
  })

  it('renders caret without class when caretClass is empty string', () => {
    const { body } = render(ComarkNode, {
      props: { node: 'text', caretClass: '' },
    })
    expect(html(body)).toBe(`text<span style="${CARET_STYLE}">\u2009</span>`)
  })

  it('threads caret to deepest last text node', async () => {
    const tree = await parse('first **last**')
    const { body } = render(ComarkNode, {
      props: { node: tree.nodes[0], caretClass: '' },
    })
    const output = html(body)
    // Caret should be inside <strong>, after "last"
    expect(output).toContain(
      `last<span style="${CARET_STYLE}">\u2009</span></strong>`,
    )
    // Not after the </strong>
    expect(output).not.toContain(`</strong><span`)
  })

  it('threads caret through deeply nested structure', async () => {
    const tree = await parse('*__**deep**__*')
    const { body } = render(ComarkNode, {
      props: { node: tree.nodes[0], caretClass: 'c' },
    })
    const output = html(body)
    // Caret should be at the very deepest level, after "deep"
    expect(output).toContain(
      `deep<span class="c" style="${CARET_STYLE}">\u2009</span>`,
    )
  })

  it('does not attach caret to non-last children', async () => {
    const tree = await parse('**first** last')
    const { body } = render(ComarkNode, {
      props: { node: tree.nodes[0], caretClass: '' },
    })
    const output = html(body)
    // Caret should be after "last" (the last child), not inside <strong>
    expect(output).toContain(`last<span style="${CARET_STYLE}">\u2009</span>`)
    expect(output).not.toContain(`first<span`)
  })
})

describe('ComarkRenderer', () => {
  it('renders a heading with inline markup', async () => {
    const tree = await parse('# Hello **World**')
    const { body } = render(ComarkRenderer, { props: { tree } })
    const output = html(body)
    expect(output).toContain('<h1 id="hello-strong-world">')
    expect(output).toContain('Hello <strong>World</strong>')
    expect(output).toContain('</h1>')
    expect(output).toMatch(/^<div class="comark-content ">.*<\/div>$/)
  })

  it('renders multiple block-level elements', async () => {
    const tree = await parse('# Heading\n\nA paragraph\n\n- item 1\n- item 2')
    const { body } = render(ComarkRenderer, { props: { tree } })
    const output = html(body)
    expect(output).toContain('<h1')
    expect(output).toContain('<p>A paragraph</p>')
    expect(output).toContain('<ul>')
    expect(output).toContain('<li>item 1</li>')
    expect(output).toContain('<li>item 2</li>')
  })

  it('renders an empty tree as an empty wrapper', () => {
    const tree = { nodes: [], frontmatter: {}, meta: {} }
    const { body } = render(ComarkRenderer, { props: { tree } })
    expect(html(body)).toBe('<div class="comark-content "></div>')
  })

  it('applies a custom class to the wrapper', async () => {
    const tree = await parse('hello')
    const { body } = render(ComarkRenderer, {
      props: { tree, class: 'prose' },
    })
    const output = html(body)
    expect(output).toMatch(/^<div class="comark-content prose">/)
    expect(output).toContain('<p>hello</p>')
  })

  it('renders inline code', async () => {
    const tree = await parse('use `const x = 1`')
    const { body } = render(ComarkRenderer, { props: { tree } })
    expect(html(body)).toContain('<code>const x = 1</code>')
  })

  it('renders links', async () => {
    const tree = await parse('[click me](https://example.com)')
    const { body } = render(ComarkRenderer, { props: { tree } })
    expect(html(body)).toContain('<a href="https://example.com">click me</a>')
  })

  it('renders images', async () => {
    const tree = await parse('![alt text](image.png)')
    const { body } = render(ComarkRenderer, { props: { tree } })
    expect(html(body)).toContain('<img src="image.png" alt="alt text">')
  })

  it('renders blockquotes', async () => {
    const tree = await parse('> quoted text')
    const { body } = render(ComarkRenderer, { props: { tree } })
    const output = html(body)
    expect(output).toContain('<blockquote>')
    expect(output).toContain('quoted text')
  })

  it('renders emphasis and strong', async () => {
    const tree = await parse('*em* and **strong**')
    const { body } = render(ComarkRenderer, { props: { tree } })
    const output = html(body)
    expect(output).toContain('<em>em</em>')
    expect(output).toContain('<strong>strong</strong>')
  })
})

describe('custom components', () => {
  it('resolves custom component for MDC syntax', async () => {
    const tree = await parse('::alert{type="warning"}\nWatch out!\n::')
    const { body } = render(ComarkRenderer, {
      props: { tree, components: { alert: Alert } },
    })
    const output = html(body)
    expect(output).toContain('<div class="alert alert-warning" role="alert">')
    expect(output).toContain('Watch out!')
  })

  it('resolves component by PascalCase key', async () => {
    const tree = await parse('::alert{type="info"}\nInfo message\n::')
    const { body } = render(ComarkRenderer, {
      props: { tree, components: { Alert } },
    })
    const output = html(body)
    expect(output).toContain('<div class="alert alert-info" role="alert">')
    expect(output).toContain('Info message')
  })

  it('resolves Prose-prefixed component for native tags', async () => {
    const tree = await parse('# Custom Heading')
    const { body } = render(ComarkRenderer, {
      props: { tree, components: { ProseH1 } },
    })
    const output = html(body)
    expect(output).toContain('class="prose-heading"')
    expect(output).toContain('Custom Heading')
  })

  it('renders children inside custom components', async () => {
    const tree = await parse('::alert{type="info"}\n**Bold** text\n::')
    const { body } = render(ComarkRenderer, {
      props: { tree, components: { alert: Alert } },
    })
    const output = html(body)
    expect(output).toContain('<div class="alert alert-info" role="alert">')
    expect(output).toContain('<strong>Bold</strong>')
    expect(output).toContain(' text')
  })

  it('falls back to native element when no component matches', async () => {
    const tree = await parse('::alert{type="info"}\ncontent\n::')
    const { body } = render(ComarkRenderer, {
      props: { tree, components: {} },
    })
    const output = html(body)
    // Should render as a native <alert> element, not a custom component
    expect(output).toContain('<alert')
    expect(output).toContain('content')
  })
})
