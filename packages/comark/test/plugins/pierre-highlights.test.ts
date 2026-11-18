import { describe, expect, it, vi } from 'vitest'
import { codeToTokens } from '@pierre/highlights'
import githubDark from '@pierre/highlights/themes/github-dark'
import { createMarkdownParser, parseMarkdown } from '../../src/index'
import { renderMarkdown } from '../../src/render'
import pierreHighlights, {
  pierreHighlightsCodeBlocks,
  resolvePierreHighlightsLanguage,
} from '../../src/plugins/pierre-highlights'
import type { ElementNode, Node } from '../../src/types'

vi.mock('@pierre/highlights', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@pierre/highlights')>()
  return { ...actual, codeToTokens: vi.fn(actual.codeToTokens) }
})

function find(nodes: Node[], tag: string): ElementNode | undefined {
  for (const node of nodes) {
    if (!Array.isArray(node)) continue
    if (node[0] === tag) return node as ElementNode
    const nested = find(node.slice(2) as Node[], tag)
    if (nested) return nested
  }
  return undefined
}

function textOf(node: Node): string {
  if (typeof node === 'string') return node
  if (node[0] === null) return ''
  let out = ''
  for (let i = 2; i < node.length; i++) out += textOf(node[i] as Node)
  return out
}

function spans(node: ElementNode): ElementNode[] {
  const out: ElementNode[] = []
  for (const child of node.slice(2) as Node[]) {
    if (!Array.isArray(child) || child[0] !== 'span') continue
    if (typeof child[2] === 'string') out.push(child as ElementNode)
    else out.push(...spans(child as ElementNode))
  }
  return out
}

describe('resolvePierreHighlightsLanguage', () => {
  it('maps Comark fence names and treats a missing language as plain text', () => {
    expect(resolvePierreHighlightsLanguage('comark')).toBe('mdc')
    expect(resolvePierreHighlightsLanguage('json-render')).toBe('json')
    expect(resolvePierreHighlightsLanguage(undefined)).toBe('text')
    expect(resolvePierreHighlightsLanguage(' TypeScript ')).toBe('typescript')
    expect(resolvePierreHighlightsLanguage('not-a-real-lang')).toBeUndefined()
    // Its tokens drop escape sequences, which Markdown output must keep.
    expect(resolvePierreHighlightsLanguage('ansi')).toBeUndefined()
    // A `::pre{language=…}` wrapper can set any JSON value.
    expect(resolvePierreHighlightsLanguage([1])).toBe('text')
  })
})

describe('pierre-highlights plugin', () => {
  it('highlights a fence with the default light colors and --shiki-dark variables', async () => {
    const source = 'const answer = 42\nconsole.log(answer)'
    const tree = await parseMarkdown(`\`\`\`ts\n${source}\n\`\`\``, { plugins: [pierreHighlights()] })
    const pre = find(tree.nodes, 'pre')!

    expect(pre[1].class).toBe('shiki pierre-highlights')
    expect(textOf(pre)).toBe(source)
    const code = pre[2] as ElementNode
    expect(code.filter((child) => Array.isArray(child) && child[1].class === 'line')).toHaveLength(2)
    // Material Theme Lighter / Palenight numbers, the Shiki plugin's default pair
    const number = spans(code).find((span) => span[2] === '42')!
    expect(number[1].style).toBe('color:#f76d47;--shiki-dark:#f78c6c')
  })

  it('emits no dark variables with a single theme', async () => {
    const tree = await parseMarkdown('```js\nconst a = 1\n```', {
      plugins: [pierreHighlights({ themes: { dark: githubDark } })],
    })
    const styles = spans(find(tree.nodes, 'pre')![2] as ElementNode).map((span) => span[1].style as string)
    expect(styles.length).toBeGreaterThan(0)
    expect(styles.every((style) => style.startsWith('color:') && !style.includes('--shiki-dark'))).toBe(true)
  })

  it('marks the lines selected in the fence info', async () => {
    const tree = await parseMarkdown('```js {2}\na\nb\nc\n```', { plugins: [pierreHighlights()] })
    const lines = (find(tree.nodes, 'pre')![2] as ElementNode).filter((child) => Array.isArray(child)) as ElementNode[]
    expect(lines.map((line) => line[1].class)).toEqual(['line', 'line highlight', 'line'])
  })

  it('keeps an unknown language as plain text under the highlighter class', async () => {
    const tree = await parseMarkdown('```nope\nx < y\n```', { plugins: [pierreHighlights()] })
    expect(find(tree.nodes, 'pre')).toEqual([
      'pre',
      { language: 'nope', class: 'shiki pierre-highlights' },
      ['code', { class: 'language-nope' }, 'x < y'],
    ])
  })

  it('highlights code blocks nested inside components', async () => {
    const tree = await parseMarkdown('::card\n```js\nconst a = 1\n```\n::', { plugins: [pierreHighlights()] })
    expect(spans(find(tree.nodes, 'pre')![2] as ElementNode).length).toBeGreaterThan(1)
  })

  it('adds the theme colors to <pre> with preStyles', async () => {
    const tree = await parseMarkdown('```js\na\n```', { plugins: [pierreHighlights({ preStyles: true })] })
    expect(find(tree.nodes, 'pre')![1].style).toBe(
      'background-color:#fafafa;--shiki-dark-bg:#292d3e;color:#90a4ae;--shiki-dark:#babed8'
    )
  })

  it('leaves the streaming parser cache unhighlighted between updates', async () => {
    const parse = createMarkdownParser({ plugins: [pierreHighlights()] })
    let tree
    for (const tail of ['a', 'ab', 'abc']) tree = await parse(`\`\`\`nope\nx\n\`\`\`\n\n${tail}`, { streaming: true })
    expect(find(tree!.nodes, 'pre')![1].class).toBe('shiki pierre-highlights')
  })

  it('tokenizes an unchanged fence once while later content streams, without sharing output nodes', async () => {
    const parse = createMarkdownParser({ plugins: [pierreHighlights()] })
    const source = (tail: string) => `\`\`\`ts\nconst a = 1\n\`\`\`\n\n${tail}`
    const first = await parse(source('a'), { streaming: true })
    const calls = vi.mocked(codeToTokens).mock.calls.length
    // A later plugin or the caller editing the output must not leak into the next update.
    ;(first.nodes[0] as ElementNode)[1].class = 'edited'
    const second = await parse(source('ab'), { streaming: true })

    expect(vi.mocked(codeToTokens).mock.calls.length).toBe(calls)
    expect((second.nodes[0] as ElementNode)[1].class).toBe('shiki pierre-highlights')
    expect(spans((second.nodes[0] as ElementNode)[2] as ElementNode).length).toBeGreaterThan(1)
  })

  it('leaves code nested deeper than the walk limit untouched instead of overflowing', () => {
    let node: Node = ['pre', { language: 'js' }, ['code', {}, 'const a = 1']]
    for (let i = 0; i < 20_000; i++) node = ['div', {}, node]
    const tree = { nodes: [node], frontmatter: {}, meta: {} }
    expect(pierreHighlightsCodeBlocks(tree)).toBe(tree)
  })

  it('round-trips to the original markdown, keeping only the user class', async () => {
    const source = '```js {2}\nconst a = 1\nb\n```\n\nThe `Ref<T>`{lang="ts-type" .tight} type.'
    const tree = await parseMarkdown(source, { plugins: [pierreHighlights()] })
    expect(find(find(tree.nodes, 'p')!.slice(2) as Node[], 'code')![1].class).toBe('shiki pierre-highlights . tight')
    expect(await renderMarkdown(tree)).toBe(source)
  })
})

describe('pierre-highlights inline code', () => {
  it('highlights inline code that declares a language', async () => {
    const tree = await parseMarkdown('Run `const a = 1`{lang="js"} now', { plugins: [pierreHighlights()] })
    const code = find(tree.nodes, 'code')!
    expect(code[1].class).toBe('shiki pierre-highlights')
    expect(textOf(code)).toBe('const a = 1')
    expect(spans(code).length).toBeGreaterThan(1)
  })

  it('tokenizes ts-type as a type and drops the seed text', async () => {
    const tree = await parseMarkdown('`Ref<T>`{lang="ts-type"}', { plugins: [pierreHighlights()] })
    const code = find(tree.nodes, 'code')!
    expect(textOf(code)).toBe('Ref<T>')
    // Seeded with `let a:`, `Ref` is a type, not a plain identifier.
    expect(spans(code)[0]).toEqual(['span', { style: 'color:#e2931d;--shiki-dark:#ffcb6b' }, 'Ref'])
  })

  it('leaves natural languages, raw HTML code and disabled inline code alone', async () => {
    const french = await parseMarkdown('`Bonjour`{lang="fr"}', { plugins: [pierreHighlights()] })
    expect(find(french.nodes, 'code')).toEqual(['code', { lang: 'fr' }, 'Bonjour'])

    const html = await parseMarkdown('<code lang="js">const a = 1</code>', { plugins: [pierreHighlights()] })
    expect(find(html.nodes, 'code')!.slice(2)).toEqual(['const a = 1'])

    const disabled = await parseMarkdown('`const a = 1`{lang="js"}\n\n```js\nconst a = 1\n```', {
      plugins: [pierreHighlights({ inlineCode: false })],
    })
    expect(find(disabled.nodes, 'p')).toEqual(['p', {}, ['code', { lang: 'js' }, 'const a = 1']])
    expect(find(disabled.nodes, 'pre')![1].class).toBe('shiki pierre-highlights')
  })
})
