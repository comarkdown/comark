import { describe, expect, it } from 'vitest'
import { createMarkdownExit } from 'markdown-exit/core'
import { parseMarkdown } from '../src/index'
import { render } from '../src/render'

// `markdown/html` output is read by plain CommonMark parsers; SPEC fixtures pin the exact output.
async function reparse(markdown: string) {
  const output = await render(await parseMarkdown(markdown), { format: 'markdown/html' })
  return createMarkdownExit({ html: true }).parse(output, {})
}

describe('render: markdown/html', () => {
  it('keeps the markdown inside a component tag parseable', async () => {
    const tokens = await reparse(
      ['::steps', '### Create', '', 'Run:', '', '```bash', 'npx create', '```', '', '- a', '- b', '::'].join('\n')
    )

    const types = tokens.map((token) => token.type)
    expect(types).toContain('heading_open')
    expect(types).toContain('fence')
    expect(types).toContain('bullet_list_open')
  })

  it('keeps a code block holding indented fences whole', async () => {
    const code = '::tabs\n  :::tabs-item\n    ```mdc\n    ::callout\n    ::\n    ```\n  :::\n\n::'
    const tokens = await reparse(`::code-preview\n#code\n\`\`\`\`mdc\n${code}\n\`\`\`\`\n::\n\nAfter`)

    expect(tokens.filter((token) => token.type === 'fence').map((token) => token.content)).toEqual([`${code}\n`])
    expect(tokens.at(-2)?.content).toBe('After')
  })

  it('keeps a component in a list item out of the paragraph before it', async () => {
    const tokens = await reparse('- para\n  ::alert\n  hi\n  ::')

    // A custom tag cannot interrupt a paragraph, so `<alert>` must follow its own blank line.
    const paragraphs = tokens.filter((token) => token.type === 'inline').map((token) => token.content)
    expect(paragraphs).toEqual(['para', 'hi'])
    expect(tokens.filter((token) => token.type === 'html_block').map((token) => token.content.trim())).toEqual([
      '<alert>',
      '</alert>',
    ])
  })
})
