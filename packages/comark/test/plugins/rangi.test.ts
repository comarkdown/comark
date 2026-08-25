import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import { renderMarkdown } from '../../src/render'
import rangi, { comarkLanguages, rangiCodeBlocks, resolveRangiLanguage, tokenizeCode } from '../../src/plugins/rangi'
import comarkLanguage, { comarkLanguages as languageAliases } from '../../src/plugins/rangi/language-comark'
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

  it('does not catastrophically backtrack on headings without attributes', () => {
    // The heading-with-attributes rule was `^ {0,3}#{1,6}[ \t]+.*?[ \t]*ATTRS[ \t]*$`:
    // the lazy `.*?` and the greedy `[ \t]*` both matched spaces, so a heading
    // followed by thousands of spaces and no `{...}` exploded combinatorially
    // (~9s for 3000 spaces).
    const payload = `# ${' '.repeat(3_000)}x`
    const tokens = tokenizeCode(payload, 'md')
    expect(tokens.map((t) => t.text).join('')).toBe(payload)
  })

  it('resolves language aliases via rangi (typescript)', () => {
    const tokens = tokenizeCode('const n: number = 1', 'typescript')
    expect(tokens.some((t) => t.type === 'kwd')).toBe(true)
  })
})

describe('comark language', () => {
  const typesOf = (code: string, lang = 'comark') => {
    const map = new Map<string, string>()
    for (const token of tokenizeCode(code, lang)) {
      if (token.type) map.set(token.text, token.type)
    }
    return map
  }

  it('is registered under every comark/markdown alias', () => {
    expect(Object.keys(comarkLanguages).sort()).toEqual(['comark', 'markdown', 'md', 'mdc'])
    expect(languageAliases).toBe(comarkLanguages)
    expect(comarkLanguages.comark).toBe(comarkLanguage)
    for (const lang of ['comark', 'mdc', 'md', 'markdown']) {
      expect(typesOf('::alert\nhi\n::', lang).get('alert')).toBe('class')
    }
  })

  it('never loses or reorders source text', () => {
    const code = '---\ntitle: x\n---\n\n# H{#id}\n\n::alert{type="a"}\n:icon[x]\n::\n\n```js\nconst a = 1\n```\n'
    expect(
      tokenizeCode(code, 'comark')
        .map((t) => t.text)
        .join('')
    ).toBe(code)
  })

  it('highlights block components, their attributes and their terminator', () => {
    const types = typesOf('::alert{type="warning" .rounded}\nbody\n::')
    expect(types.get('::')).toBe('oper')
    expect(types.get('alert')).toBe('class')
    expect(types.get('type')).toBe('var')
    expect(types.get('"warning"')).toBe('str')
    expect(types.get('.rounded')).toBe('class')
  })

  it('highlights inline components and spans', () => {
    const inline = typesOf('Text :icon{name="check"} here.')
    expect(inline.get('icon')).toBe('class')
    expect(inline.get('name')).toBe('var')

    const span = typesOf('A [text]{.accent} span.')
    expect(span.get('[text]')).toBe('oper')
    expect(span.get('.accent')).toBe('class')
  })

  it('highlights bindings with their default operator', () => {
    const types = typesOf('{{ user.name || Anonymous }}')
    expect(types.get('{{')).toBe('oper')
    expect(types.get(' user.name ')).toBe('var')
    expect(types.get('||')).toBe('oper')
    expect(types.get(' Anonymous ')).toBe('str')
  })

  it('highlights frontmatter as yaml, but only at the top of the document', () => {
    const types = typesOf('---\ntitle: Hello\n---\n\nbody\n')
    expect(types.get('---')).toBe('oper')
    expect(types.get('title')).toBe('var')

    // A `---` further down is a thematic break, not frontmatter
    expect(typesOf('body\n\n---\n\nmore').get('---')).toBe('cmnt')
  })

  it('highlights yaml props inside a block component', () => {
    const types = typesOf('::card\n---\ntitle: x\n---\n::')
    expect(types.get('---')).toBe('oper')
    expect(types.get('title')).toBe('var')
  })

  it('highlights headings with attributes, alerts, slots and task lists', () => {
    expect(typesOf('# Title{#slug}').get('#slug')).toBe('class')
    expect(typesOf('> [!NOTE]').get('[!NOTE]')).toBe('kwd')
    expect(typesOf('::card\n#footer\nbody\n::').get('#footer')).toBe('var')
    expect(typesOf('- [x] done').get('[x]')).toBe('bool')
  })

  it('keeps rangi markdown rules for standard syntax', () => {
    const types = typesOf('# Heading\n\n**bold** _em_ `code` ~~del~~ [link](/a)')
    expect(types.get('# Heading')).toBe('section')
    expect(types.get('**bold**')).toBe('class')
    expect(types.get('_em_')).toBe('kwd')
    expect(types.get('`code`')).toBe('str')
    expect(types.get('~~del~~')).toBe('var')
    expect(types.get('[link]')).toBe('oper')
  })

  it('highlights fenced code with the fenced language', () => {
    const types = typesOf('```js\nconst x = 1\n```')
    expect(types.get('```js')).toBe('kwd')
    expect(types.get('const')).toBe('kwd')
    expect(types.get('1')).toBe('num')
  })

  it('leaves colons that are not components alone', () => {
    const code = 'A ratio of 16:9, a time of 1:30 and http://x.dev.'
    const tokens = tokenizeCode(code, 'comark')
    expect(tokens.every((t) => t.type !== 'class')).toBe(true)
  })

  it('lets a custom grammar override the comark default', () => {
    const tokens = tokenizeCode('::alert\nhi\n::', 'md', { md: [[/hi/g, 'num']] })
    expect(tokens.find((t) => t.text === 'hi')?.type).toBe('num')
    expect(tokens.some((t) => t.text === 'alert')).toBe(false)
  })
})

describe('rangi plugin', () => {
  it('applies default dual theme inline colors when theme is omitted', async () => {
    const md = '```js\nconst x = 1\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)!
    expect((pre[1] as any).class).toContain('shiki')
    expect((pre[1] as any).class).toContain('shj-lang-js')
    // Token spans still get inline colors; pre styles are opt-in
    expect((pre[1] as any).style).toBeUndefined()
  })

  it('adds pre background/foreground styles when preStyles is true', async () => {
    const md = '```js\nconst x = 1\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi({ preStyles: true })] })
    const pre = findPre(tree.nodes)!
    expect((pre[1] as any).style).toBeTruthy()
    expect((pre[1] as any).style).toContain('background-color:')
    expect((pre[1] as any).style).toContain('color:')
  })

  it('does not add pre styles by default', async () => {
    const md = '```js\nconst x = 1\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)!
    expect((pre[1] as any).style).toBeUndefined()
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

  it('highlights a comark fence with the comark grammar', async () => {
    const md = '````comark\n::alert{type="info"}\nBody\n::\n````'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)!
    expect((pre[1] as any).class).toContain('shj-lang-comark')
    expect(textOf(pre)).toBe('::alert{type="info"}\nBody\n::')

    const code = pre[2] as ElementNode
    const hasComponentName = code
      .slice(2)
      .some((n) => Array.isArray(n) && n[2] === 'alert' && String((n[1] as any)?.class).includes('shj-class'))
    expect(hasComponentName).toBe(true)
  })

  it('resolves language aliases (typescript)', async () => {
    const md = '```typescript\nconst n: number = 1\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)
    expect((pre![1] as any).class).toContain('shj-lang-typescript')
  })

  it('applies line highlight classes from fence info without lineNumbers', async () => {
    const md = '```js {2-3}\nconst a = 1\nconst b = 2\nconst c = 3\n```'
    const tree = await parseMarkdown(md, { plugins: [rangi()] })
    const pre = findPre(tree.nodes)!
    const code = pre[2] as ElementNode

    const lines = code.slice(2).filter((n) => Array.isArray(n) && n[0] === 'span') as ElementNode[]
    expect(lines.length).toBe(3)
    expect((lines[0][1] as any).class).toBe('line')
    expect((lines[1][1] as any).class).toBe('line highlight')
    expect((lines[2][1] as any).class).toBe('line highlight')
    expect(textOf(pre)).toBe('const a = 1\nconst b = 2\nconst c = 3')
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
          preStyles: true,
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
