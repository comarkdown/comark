import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import components from '../../src/plugins/components'
import frontmatter from '../../src/plugins/frontmatter'
import html from '../../src/plugins/html'

describe('default plugin options', () => {
  describe('registerDefaultPlugins', () => {
    it('parses component syntax by default', async () => {
      const tree = await parseMarkdown('::alert\nContent\n::')
      expect(tree.nodes).toEqual([['alert', {}, 'Content']])
    })

    it('renders task-list checkboxes by default', async () => {
      const tree = await parseMarkdown('- [ ] todo')
      expect(JSON.stringify(tree.nodes)).toContain('task-list-item-checkbox')
    })

    it('transforms alert blockquotes by default', async () => {
      const tree = await parseMarkdown('> [!NOTE]\n> hi')
      expect(tree.nodes).toEqual([['blockquote', { as: 'note' }, 'hi']])
    })

    it('parses HTML by default', async () => {
      const tree = await parseMarkdown('<strong class="bold">Hello</strong>')
      expect(tree.nodes).toEqual([['p', {}, ['strong', { class: 'bold', $: { html: 1, block: 0 } }, 'Hello']]])
    })

    it('parses frontmatter by default', async () => {
      const tree = await parseMarkdown('---\ntitle: Hello\n---\n\n# Hi')
      expect(tree.frontmatter).toEqual({ title: 'Hello' })
      expect(tree.nodes).toEqual([['h1', { id: 'hi' }, 'Hi']])
    })

    it('treats frontmatter as content when registerDefaultPlugins is false', async () => {
      const tree = await parseMarkdown('---\ntitle: Hello\n---\n\n# Hi', { registerDefaultPlugins: false })
      expect(tree.frontmatter).toEqual({})
      expect(tree.nodes[0]).toEqual(['hr', {}])
    })

    it('parses frontmatter via an explicit plugin when registerDefaultPlugins is false', async () => {
      const tree = await parseMarkdown('---\ntitle: Hello\n---\n\n# Hi', {
        registerDefaultPlugins: false,
        plugins: [frontmatter()],
      })
      expect(tree.frontmatter).toEqual({ title: 'Hello' })
      expect(tree.nodes).toEqual([['h1', { id: 'hi' }, 'Hi']])
    })

    it('treats HTML as plain text when registerDefaultPlugins is false', async () => {
      const tree = await parseMarkdown('<em>hi</em>', { registerDefaultPlugins: false })
      expect(tree.nodes).toEqual([['p', {}, '<em>hi</em>']])
    })

    it('parses HTML via an explicit html plugin when registerDefaultPlugins is false', async () => {
      const tree = await parseMarkdown('<em>hi</em>', {
        registerDefaultPlugins: false,
        plugins: [html()],
      })
      expect(tree.nodes).toEqual([['p', {}, ['em', { $: { html: 1, block: 0 } }, 'hi']]])
    })

    it('parses attributes by default', async () => {
      const tree = await parseMarkdown('Hello {.cls}')
      expect(tree.nodes).toEqual([['p', { class: 'cls' }, 'Hello']])
    })

    it('treats attribute braces as plain text when registerDefaultPlugins is false', async () => {
      const tree = await parseMarkdown('Hello {.cls}', { registerDefaultPlugins: false })
      expect(tree.nodes).toEqual([['p', {}, 'Hello {.cls}']])
    })

    it('leaves component syntax literal when disabled', async () => {
      const tree = await parseMarkdown('::alert\nContent\n::', { registerDefaultPlugins: false })
      expect(tree.nodes).toEqual([['p', {}, '::alert\nContent\n::']])
    })

    it('keeps the [ ] marker literal when disabled', async () => {
      const tree = await parseMarkdown('- [ ] todo', { registerDefaultPlugins: false })
      expect(tree.nodes).toEqual([['ul', {}, ['li', {}, '[ ] todo']]])
    })

    it('keeps the [!NOTE] marker literal when disabled', async () => {
      const tree = await parseMarkdown('> [!NOTE]\n> hi', { registerDefaultPlugins: false })
      expect(tree.nodes).toEqual([['blockquote', {}, '[!NOTE]\nhi']])
    })

    it('does not append component closers when disabled', async () => {
      const tree = await parseMarkdown('::alert\nContent', { registerDefaultPlugins: false })
      expect(tree.nodes).toEqual([['p', {}, '::alert\nContent']])
    })

    it('keeps a literal trailing :: line when disabled', async () => {
      const tree = await parseMarkdown('para\n\n::', { registerDefaultPlugins: false })
      expect(tree.nodes).toEqual([
        ['p', {}, 'para'],
        ['p', {}, '::'],
      ])
    })

    it('still auto-closes markdown markers when disabled', async () => {
      const tree = await parseMarkdown('**bold', { registerDefaultPlugins: false })
      expect(tree.nodes).toEqual([['p', {}, ['strong', {}, 'bold']]])
    })
  })

  describe('html option', () => {
    it('treats HTML as plain text when html: false', async () => {
      const tree = await parseMarkdown('<strong>Hello</strong>', { html: false })
      expect(tree.nodes).toEqual([['p', {}, '<strong>Hello</strong>']])
    })

    it('enables HTML via the explicit html plugin when html: false', async () => {
      const tree = await parseMarkdown('<strong>Hello</strong>', {
        html: false,
        plugins: [html()],
      })
      expect(tree.nodes).toEqual([['p', {}, ['strong', { $: { html: 1, block: 0 } }, 'Hello']]])
    })

    it('replaces the default html plugin with a same-name user plugin', async () => {
      const tree = await parseMarkdown('<strong>Hello</strong>', {
        plugins: [{ name: 'html' }],
      })
      expect(tree.nodes).toEqual([['p', {}, '<strong>Hello</strong>']])
    })

    it('disables HTML via html({ enabled: false })', async () => {
      const tree = await parseMarkdown('<strong>Hello</strong>', {
        plugins: [html({ enabled: false })],
      })
      expect(tree.nodes).toEqual([['p', {}, '<strong>Hello</strong>']])
    })
  })

  describe('user plugin override', () => {
    it('replaces the default attributes plugin with a same-name user plugin', async () => {
      const tree = await parseMarkdown('Hello {.cls}', {
        plugins: [{ name: 'attributes' }],
      })
      expect(tree.nodes).toEqual([['p', {}, 'Hello {.cls}']])
    })

    it('replaces the default alert plugin with a same-name user plugin', async () => {
      const tree = await parseMarkdown('> [!NOTE]\n> hi', {
        plugins: [{ name: 'alert' }],
      })
      expect(tree.nodes).toEqual([['blockquote', {}, ['span', {}, '!NOTE'], '\nhi']])
    })

    it('replaces the default task-list plugin with a same-name user plugin', async () => {
      const tree = await parseMarkdown('- [ ] todo', {
        plugins: [{ name: 'task-list' }],
      })
      expect(tree.nodes).toEqual([['ul', {}, ['li', {}, ' todo']]])
    })

    it('keeps an explicit components plugin active with registerDefaultPlugins: false', async () => {
      const tree = await parseMarkdown('::alert\nContent', {
        registerDefaultPlugins: false,
        plugins: [components()],
      })
      expect(tree.nodes).toEqual([['alert', {}, 'Content']])
    })
  })
})
