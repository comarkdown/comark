import { describe, expect, it } from 'vitest'
import { createMarkdownParser, parseMarkdown } from '../src/core'
import { parseMarkdown as parseMarkdownWithDefaults } from '../src/index'
import components from '../src/plugins/components'
import frontmatter from '../src/plugins/frontmatter'

describe('comark/core', () => {
  it('registers no default plugins', async () => {
    const tree = await parseMarkdown('---\ntitle: Hi\n---\n\n::alert\nhi\n::\n\n<b>x</b>')

    expect(tree.frontmatter).toEqual({})
    expect(tree.nodes).toEqual([
      ['hr', {}],
      ['h2', { id: 'title-hi' }, 'title: Hi'],
      ['p', {}, '::alert\nhi\n::'],
      ['p', {}, '<b>x</b>'],
    ])
  })

  it('runs only the plugins it is given', async () => {
    const tree = await parseMarkdown('---\ntitle: Hi\n---\n\n::alert\nhi\n::', {
      plugins: [frontmatter(), components()],
    })

    expect(tree.frontmatter).toEqual({ title: 'Hi' })
    expect(tree.nodes).toEqual([['alert', {}, 'hi']])
  })

  it('does not auto-close by default', async () => {
    const tree = await parseMarkdown('**bold')

    expect(tree.nodes).toEqual([['p', {}, '**bold']])
  })

  it('calls an autoClose function with the streaming flag', async () => {
    const calls: [string, boolean | undefined][] = []
    const parse = createMarkdownParser({
      autoClose: (markdown, streaming) => {
        calls.push([markdown, streaming])
        return markdown + '**'
      },
    })

    expect((await parse('**a')).nodes).toEqual([['p', {}, ['strong', {}, 'a']]])
    await parse('**b', { streaming: true })

    expect(calls).toEqual([
      ['**a', undefined],
      ['**b', true],
    ])
  })

  it('matches the root parser when given the same plugins', async () => {
    const source = '# Title\n\n::alert\n**hi**\n::'
    const core = await parseMarkdown(source, { plugins: [components()] })
    const root = await parseMarkdownWithDefaults(source, {
      registerDefaultPlugins: false,
      plugins: [components()],
      autoClose: false,
    })

    expect(core).toEqual(root)
  })
})
