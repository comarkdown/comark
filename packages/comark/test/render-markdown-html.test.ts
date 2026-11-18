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

  it('keeps binding props as bindings', async () => {
    const source = '::card{title="Hello"}\n:::badge{:label="props.title" :count="5"}\n:::\n::'
    const output = await render(await parseMarkdown(source), { format: 'markdown/html' })
    const [[, , badge]] = (await parseMarkdown(output)).nodes as any
    expect(badge[1]).toMatchObject({ ':label': 'props.title', ':count': '5' })

    const tokens = (await reparse(source)).flatMap((token) => token.children ?? [])
    expect(tokens.find((token) => token.content.startsWith('<badge'))).toMatchObject({
      type: 'html_inline',
      content: '<badge :label="props.title" :count="5">',
    })
  })

  it('keeps a code block holding indented fences whole', async () => {
    const code = '::tabs\n  :::tabs-item\n    ```mdc\n    ::callout\n    ::\n    ```\n  :::\n\n::'
    const tokens = await reparse(`::code-preview\n#code\n\`\`\`\`mdc\n${code}\n\`\`\`\`\n::\n\nAfter`)

    expect(tokens.filter((token) => token.type === 'fence').map((token) => token.content)).toEqual([`${code}\n`])
    expect(tokens.at(-2)?.content).toBe('After')
  })
})
