import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import { renderMarkdown } from '../../src/render'
import rangi, { rangiCodeBlocks, resolveRangiLanguage, tokenizeCode } from '../../src/plugins/rangi'
import type { ElementNode, MarkdownDocument, Node } from '../../src/types'

function findPre(nodes: Node[]): ElementNode | undefined {
  for (const node of nodes) {
    if (!Array.isArray(node)) continue
    if (node[0] === 'pre') return node as ElementNode
    const nested = findPre(node.slice(2) as Node[])
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

describe('resolveRangiLanguage', () => {
  it('passes fence languages through (rangi handles aliases)', () => {
    expect(resolveRangiLanguage('javascript')).toBe('javascript')
    expect(resolveRangiLanguage('typescript')).toBe('typescript')
    expect(resolveRangiLanguage('js')).toBe('js')
  })

  it('uses plain when the fence language is missing/empty', () => {
    expect(resolveRangiLanguage(undefined)).toBe('plain')
    expect(resolveRangiLanguage('')).toBe('plain')
    expect(resolveRangiLanguage('not-a-real-lang')).toBe('not-a-real-lang')
  })
})

describe('tokenizeCode', () => {
  it('tokenizes javascript with keyword/number types', () => {
    const tokens = tokenizeCode('const x = 1', 'js')
    const types = tokens.filter((t) => t.type).map((t) => t.type)
    expect(types).toContain('kwd')
    expect(types).toContain('num')
    expect(tokens.map((t) => t.text).join('')).toBe('const x = 1')
  })

  it('resolves language aliases via rangi (typescript)', () => {
    const tokens = tokenizeCode('const n: number = 1', 'typescript')
    expect(tokens.some((t) => t.type === 'kwd')).toBe(true)
  })
})

describe('rangi plugin', () => {
  it('applies default dual theme inline colors when theme is omitted', async () => {
    const md = '```js\nconst x = 1\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)!
    expect((pre[1] as any).class).toContain('shiki')
    expect((pre[1] as any).class).toContain('shj-lang-js')
    expect((pre[1] as any).style).toBeTruthy()
  })

  it('highlights a javascript fence into typed spans', async () => {
    const md = '```js\nconst x = 1\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)

    expect(pre).toBeTruthy()
    expect((pre![1] as any).class).toContain('shj')
    expect((pre![1] as any).class).toContain('shj-lang-js')
    expect((pre![1] as any).language).toBe('js')

    const code = pre![2] as ElementNode
    const hasTokenSpan = code.slice(2).some((child) => {
      if (!Array.isArray(child)) return false
      if (child[0] === 'span' && (child[1] as any)?.class?.includes?.('line')) {
        return child
          .slice(2)
          .some(
            (n) =>
              Array.isArray(n) && typeof (n[1] as any)?.class === 'string' && (n[1] as any).class.includes('shj-kwd')
          )
      }
      return typeof (child[1] as any)?.class === 'string' && (child[1] as any).class.includes('shj-')
    })
    expect(hasTokenSpan).toBe(true)
    expect(textOf(pre!)).toBe('const x = 1')
  })

  it('resolves language aliases (typescript)', async () => {
    const md = '```typescript\nconst n: number = 1\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)
    expect((pre![1] as any).class).toContain('shj-lang-typescript')
  })

  it('applies line highlight classes from fence info', async () => {
    const md = '```js {2}\nconst a = 1\nconst b = 2\nconst c = 3\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi({ lineNumbers: true })] })
    const pre = findPre(tree.nodes)!
    const code = pre[2] as ElementNode

    const lines = code.slice(2).filter((n) => Array.isArray(n) && n[0] === 'span') as ElementNode[]
    expect(lines.length).toBe(3)
    expect((lines[0][1] as any).class).toBe('line')
    expect((lines[1][1] as any).class).toBe('line highlight')
    expect((lines[2][1] as any).class).toBe('line')
  })

  it('preserves user class after the `.` separator', async () => {
    const document: MarkdownDocument = {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'js', class: 'my-block' }, ['code', {}, 'const x = 1']]],
    }

    const tree = await rangiCodeBlocks(document)
    const pre = tree.nodes[0] as ElementNode
    expect((pre[1] as any).class).toBe('shj shiki shj-lang-js . my-block')
  })

  it('uses plain for fences with no language', async () => {
    const md = '```\nhello world\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)!
    expect((pre[1] as any).class).toContain('shj-lang-plain')
    expect(textOf(pre)).toBe('hello world')
  })

  it('does not touch non-code content', async () => {
    const md = '# Title\n\nA paragraph.'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    expect(tree.nodes).toEqual([
      ['h1', { id: 'title' }, 'Title'],
      ['p', {}, 'A paragraph.'],
    ])
  })

  it('does not wrap lines by default', async () => {
    const md = '```js\nconst x = 1\nconst y = 2\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)!
    const code = pre[2] as ElementNode
    const hasLineWrapper = code
      .slice(2)
      .some((n) => Array.isArray(n) && n[0] === 'span' && (n[1] as any)?.class === 'line')
    expect(hasLineWrapper).toBe(false)
    expect(textOf(pre)).toBe('const x = 1\nconst y = 2')
  })

  it('wraps lines when lineNumbers is true', async () => {
    const md = '```js\nconst x = 1\nconst y = 2\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi({ lineNumbers: true })] })
    const pre = findPre(tree.nodes)!
    const code = pre[2] as ElementNode
    const lines = code.slice(2).filter((n) => Array.isArray(n) && n[0] === 'span' && (n[1] as any)?.class === 'line')
    expect(lines.length).toBe(2)
    expect(textOf(pre)).toBe('const x = 1\nconst y = 2')
  })

  it('highlights code blocks nested inside components', async () => {
    const md = `::card
\`\`\`js
const x = 1
\`\`\`
::`
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)
    expect(pre).toBeTruthy()
    expect((pre![1] as any).class).toContain('shj-lang-js')
  })

  it('applies inline colors from theme option', async () => {
    const md = '```js\nconst x = 1\n```'
    const tree = await parseMarkdown(md, {
      plugins: [
        rangi({
          theme: {
            light: {
              name: 'light',
              scheme: 'light',
              bg: '#fff',
              fg: '#111',
              tokens: { kwd: '#c00', num: '#00c' },
            },
            dark: {
              name: 'dark',
              scheme: 'dark',
              bg: '#000',
              fg: '#eee',
              tokens: { kwd: '#f66', num: '#66f' },
            },
          },
        }),
      ],
    })
    const pre = findPre(tree.nodes)!
    expect((pre[1] as any).class).toContain('shiki')
    expect((pre[1] as any).style).toContain('background-color:#fff')
    expect((pre[1] as any).style).toContain('--shiki-dark-bg:#000')

    const code = pre[2] as ElementNode
    const findToken = (type: string, nodes: Node[] = code.slice(2) as Node[]): ElementNode | undefined => {
      for (const child of nodes) {
        if (!Array.isArray(child) || child[0] === null) continue
        if (String((child[1] as any)?.class || '').includes(`shj-${type}`)) return child as ElementNode
        const nested = findToken(type, child.slice(2) as Node[])
        if (nested) return nested
      }
      return undefined
    }

    const kwd = findToken('kwd')!
    expect(kwd).toBeTruthy()
    expect((kwd[1] as any).style).toContain('color:#c00')
    expect((kwd[1] as any).style).toContain('--shiki-dark:#f66')
  })
})

describe('rangi code block round-trip', () => {
  function preTree(preClass: string): MarkdownDocument {
    return {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'bash', class: preClass }, ['code', { class: 'language-bash' }, 'npx install']]],
    }
  }

  it('serializes a bare `shj` class back to a plain fence', async () => {
    const md = await renderMarkdown(preTree('shj shiki shj-lang-bash'))
    expect(md.trim()).toBe('```bash\nnpx install\n```')
    expect(md).not.toContain('::pre')
  })

  it('serializes a highlighted block with user class via `.` separator', async () => {
    const md = await renderMarkdown(preTree('shj shiki shj-lang-bash . my-block'))
    expect(md).toContain('my-block')
    expect(md).not.toContain('shj-lang')
    expect(md).toContain('npx install')
  })
})
