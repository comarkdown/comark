import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parse } from 'comark'
import ComarkRenderer from './ComarkRenderer.svelte'
import ComarkNode from './ComarkNode.svelte'

/** Strip Svelte SSR hydration comments from rendered HTML */
function html(body: string): string {
  return body.replace(/<!--[\[\]\-\d!]*-->/g, '').replace(/<!---->/g, '')
}

const CARET_STYLE = 'background-color: currentColor; display: inline-block; margin-left: 0.25rem; margin-right: 0.25rem; animation: pulse 0.75s cubic-bezier(0.4,0,0.6,1) infinite;'

describe('ComarkNode', () => {
  it('renders a text node', () => {
    const { body } = render(ComarkNode, { props: { node: 'Hello world' } })
    expect(html(body)).toBe('Hello world')
  })

  it('renders a native HTML element', () => {
    const { body } = render(ComarkNode, {
      props: { node: ['p', {}, 'A paragraph'] },
    })
    expect(html(body)).toBe('<p>A paragraph</p>')
  })

  it('renders nested elements', () => {
    const { body } = render(ComarkNode, {
      props: { node: ['p', {}, 'Hello ', ['strong', {}, 'World']] },
    })
    expect(html(body)).toBe('<p>Hello <strong>World</strong></p>')
  })

  it('renders multiple children', () => {
    const { body } = render(ComarkNode, {
      props: { node: ['p', {}, 'one ', ['em', {}, 'two'], ' three'] },
    })
    expect(html(body)).toBe('<p>one <em>two</em> three</p>')
  })

  it('maps className to class', () => {
    const { body } = render(ComarkNode, {
      props: { node: ['div', { className: 'my-class' }, 'content'] },
    })
    expect(html(body)).toBe('<div class="my-class">content</div>')
  })

  it('passes through HTML attributes', () => {
    const { body } = render(ComarkNode, {
      props: { node: ['a', { href: '/about', target: '_blank' }, 'link'] },
    })
    expect(html(body)).toBe('<a href="/about" target="_blank">link</a>')
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

  it('skips comment nodes (null tag)', () => {
    const { body } = render(ComarkNode, {
      props: { node: [null, {}, 'a comment'] },
    })
    expect(html(body)).toBe('')
  })

  it('renders self-closing elements', () => {
    const { body } = render(ComarkNode, {
      props: { node: ['hr', {}] },
    })
    expect(html(body)).toBe('<hr>')
  })

  it('renders an element with no children', () => {
    const { body } = render(ComarkNode, {
      props: { node: ['div', { class: 'empty' }] },
    })
    expect(html(body)).toBe('<div class="empty"></div>')
  })

  it('does not render caret when caretClass is null', () => {
    const { body } = render(ComarkNode, {
      props: { node: 'some text', caretClass: null },
    })
    expect(html(body)).toBe('some text')
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
    expect(html(body)).toBe(
      `text<span style="${CARET_STYLE}">\u2009</span>`,
    )
  })

  it('threads caret to deepest last text node', () => {
    const { body } = render(ComarkNode, {
      props: {
        node: ['p', {}, 'first ', ['strong', {}, 'last']],
        caretClass: '',
      },
    })
    expect(html(body)).toBe(
      `<p>first <strong>last<span style="${CARET_STYLE}">\u2009</span></strong></p>`,
    )
  })

  it('threads caret through deeply nested structure', () => {
    const { body } = render(ComarkNode, {
      props: {
        node: ['div', {}, ['p', {}, ['em', {}, ['strong', {}, 'deep']]]],
        caretClass: 'c',
      },
    })
    expect(html(body)).toBe(
      `<div><p><em><strong>deep<span class="c" style="${CARET_STYLE}">\u2009</span></strong></em></p></div>`,
    )
  })

  it('does not attach caret to non-last children', () => {
    const { body } = render(ComarkNode, {
      props: {
        node: ['p', {}, ['strong', {}, 'first'], ' last'],
        caretClass: '',
      },
    })
    // Caret should be after "last" (the last child), not after "first"
    expect(html(body)).toBe(
      `<p><strong>first</strong> last<span style="${CARET_STYLE}">\u2009</span></p>`,
    )
  })
})

describe('ComarkRenderer', () => {
  it('renders a parsed heading with inline markup', async () => {
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

  it('renders links with attributes', async () => {
    const tree = await parse('[click me](https://example.com)')
    const { body } = render(ComarkRenderer, { props: { tree } })
    expect(html(body)).toContain('<a href="https://example.com">click me</a>')
  })

  it('renders images', async () => {
    const tree = await parse('![alt text](image.png)')
    const { body } = render(ComarkRenderer, { props: { tree } })
    expect(html(body)).toContain('<img src="image.png" alt="alt text">')
  })
})
