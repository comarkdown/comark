import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import { renderMarkdown } from '../../src/render'
import speedHighlight, {
  speedHighlightCodeBlocks,
  resolveSpeedHighlightLanguage,
  tokenizeCode,
} from '../../src/plugins/speed-highlight'
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

describe('resolveSpeedHighlightLanguage', () => {
  it('maps common fence aliases to speed-highlight ids', () => {
    expect(resolveSpeedHighlightLanguage('javascript')).toBe('js')
    expect(resolveSpeedHighlightLanguage('typescript')).toBe('ts')
    expect(resolveSpeedHighlightLanguage('python')).toBe('py')
    expect(resolveSpeedHighlightLanguage('rust')).toBe('rs')
    expect(resolveSpeedHighlightLanguage('shell')).toBe('bash')
    expect(resolveSpeedHighlightLanguage('yml')).toBe('yaml')
    expect(resolveSpeedHighlightLanguage('markdown')).toBe('md')
  })

  it('passes through native speed-highlight language ids', () => {
    expect(resolveSpeedHighlightLanguage('js')).toBe('js')
    expect(resolveSpeedHighlightLanguage('ts')).toBe('ts')
    expect(resolveSpeedHighlightLanguage('json')).toBe('json')
  })

  it('falls back only when the fence language is missing/empty', () => {
    expect(resolveSpeedHighlightLanguage(undefined)).toBe('plain')
    expect(resolveSpeedHighlightLanguage('')).toBe('plain')
    // Unknown ids are passed through — speed-highlight treats them as plain text
    expect(resolveSpeedHighlightLanguage('not-a-real-lang')).toBe('not-a-real-lang')
  })

  it('honors custom langAlias and defaultLanguage', () => {
    expect(resolveSpeedHighlightLanguage('vue', { langAlias: { vue: 'html' } })).toBe('html')
    expect(resolveSpeedHighlightLanguage(undefined, { defaultLanguage: 'js' })).toBe('js')
  })
})

describe('tokenizeCode', () => {
  it('tokenizes javascript with keyword/number classes', async () => {
    const tokens = await tokenizeCode('const x = 1', 'js')
    const types = tokens.filter((t) => t.type).map((t) => t.type)
    expect(types).toContain('kwd')
    expect(types).toContain('num')
    expect(tokens.map((t) => t.text).join('')).toBe('const x = 1')
  })
})

describe('speed-highlight plugin', () => {
  it('highlights a javascript fence into typed spans', async () => {
    const md = '```js\nconst x = 1\n```'
    const tree = await parseMarkdown(md, { plugins: [speedHighlight()] })
    const pre = findPre(tree.nodes)

    expect(pre).toBeTruthy()
    expect((pre![1] as any).class).toContain('shj')
    expect((pre![1] as any).class).toContain('shj-lang-js')
    expect((pre![1] as any).language).toBe('js')

    // Should contain at least one token span with a speed-highlight class
    const code = pre![2] as ElementNode
    const hasTokenSpan = code.slice(2).some((child) => {
      if (!Array.isArray(child)) return false
      // line wrapper
      if (child[0] === 'span' && (child[1] as any)?.class?.includes?.('line')) {
        return child
          .slice(2)
          .some(
            (n) =>
              Array.isArray(n) && typeof (n[1] as any)?.class === 'string' && (n[1] as any).class.startsWith('shj-syn-')
          )
      }
      return typeof (child[1] as any)?.class === 'string' && (child[1] as any).class.startsWith('shj-syn-')
    })
    expect(hasTokenSpan).toBe(true)

    // Source text must be preserved
    expect(textOf(pre!)).toBe('const x = 1')
  })

  it('resolves language aliases (typescript → ts)', async () => {
    const md = '```typescript\nconst n: number = 1\n```'
    const tree = await parseMarkdown(md, { plugins: [speedHighlight()] })
    const pre = findPre(tree.nodes)
    expect((pre![1] as any).class).toContain('shj-lang-ts')
  })

  it('applies line highlight classes from fence info', async () => {
    const md = '```js {2}\nconst a = 1\nconst b = 2\nconst c = 3\n```'
    const tree = await parseMarkdown(md, { plugins: [speedHighlight()] })
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

    const tree = await speedHighlightCodeBlocks(document)
    const pre = tree.nodes[0] as ElementNode
    expect((pre[1] as any).class).toBe('shj shj-lang-js . my-block')
  })

  it('leaves plain fences alone when there is no code language (plain fallback)', async () => {
    const md = '```\nhello world\n```'
    const tree = await parseMarkdown(md, { plugins: [speedHighlight()] })
    const pre = findPre(tree.nodes)!
    expect((pre[1] as any).class).toContain('shj-lang-plain')
    expect(textOf(pre)).toBe('hello world')
  })

  it('does not touch non-code content', async () => {
    const md = '# Title\n\nA paragraph.'
    const tree = await parseMarkdown(md, { plugins: [speedHighlight()] })
    expect(tree.nodes).toEqual([
      ['h1', { id: 'title' }, 'Title'],
      ['p', {}, 'A paragraph.'],
    ])
  })

  it('supports disabling line wrappers', async () => {
    const md = '```js\nconst x = 1\n```'
    const tree = await parseMarkdown(md, { plugins: [speedHighlight({ lineNumbers: false })] })
    const pre = findPre(tree.nodes)!
    const code = pre[2] as ElementNode
    const hasLineWrapper = code
      .slice(2)
      .some((n) => Array.isArray(n) && n[0] === 'span' && (n[1] as any)?.class === 'line')
    expect(hasLineWrapper).toBe(false)
    expect(textOf(pre)).toBe('const x = 1')
  })

  it('highlights code blocks nested inside components', async () => {
    const md = `::card
\`\`\`js
const x = 1
\`\`\`
::`
    const tree = await parseMarkdown(md, { plugins: [speedHighlight()] })
    const pre = findPre(tree.nodes)
    expect(pre).toBeTruthy()
    expect((pre![1] as any).class).toContain('shj-lang-js')
  })
})

describe('speed-highlight code block round-trip', () => {
  function preTree(preClass: string): MarkdownDocument {
    return {
      frontmatter: {},
      meta: {},
      nodes: [['pre', { language: 'bash', class: preClass }, ['code', { class: 'language-bash' }, 'npx install']]],
    }
  }

  it('serializes a bare `shj` class back to a plain fence', async () => {
    const md = await renderMarkdown(preTree('shj shj-lang-bash'))
    expect(md.trim()).toBe('```bash\nnpx install\n```')
    expect(md).not.toContain('::pre')
  })

  it('serializes a highlighted block with user class via `.` separator', async () => {
    const md = await renderMarkdown(preTree('shj shj-lang-bash . my-block'))
    // user class must survive; highlighter classes must not
    expect(md).toContain('my-block')
    expect(md).not.toContain('shj-lang')
    expect(md).toContain('npx install')
  })

  it('keeps a plain fence for a highlighted code block inside a component slot', async () => {
    const document: MarkdownDocument = {
      frontmatter: {},
      meta: {},
      nodes: [
        [
          'code-preview',
          {},
          [
            'template',
            { name: 'code' },
            [
              'pre',
              { language: 'bash', class: 'shj shj-lang-bash' },
              ['code', { class: 'language-bash' }, 'npx install'],
            ],
          ],
        ],
      ],
    }
    const md = await renderMarkdown(document)
    expect(md).not.toContain('::pre')
    expect(md).toContain('```bash\nnpx install\n```')
  })
})
