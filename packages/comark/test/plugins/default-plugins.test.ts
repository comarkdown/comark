import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import syntax from '../../src/plugins/syntax'

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

  describe('user plugin override', () => {
    it('configures the syntax plugin through plugins', async () => {
      const tree = await parseMarkdown('Hello [world]{.cls}', {
        plugins: [syntax({ inlineSpan: false })],
      })
      expect(tree.nodes).toEqual([['p', { class: 'cls' }, 'Hello [world]']])
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

    it('keeps an explicit syntax plugin active with registerDefaultPlugins: false', async () => {
      const tree = await parseMarkdown('::alert\nContent', {
        registerDefaultPlugins: false,
        plugins: [syntax()],
      })
      expect(tree.nodes).toEqual([['alert', {}, 'Content']])
    })

    it('skips component-fence auto-close when a custom plugin replaces syntax', async () => {
      const tree = await parseMarkdown('::alert\nContent', {
        plugins: [{ name: 'syntax' }],
      })
      expect(tree.nodes).toEqual([['p', {}, '::alert\nContent']])
    })
  })
})
