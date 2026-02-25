import { describe, expect, it } from 'vitest'
import { parse } from 'comark'
import comarkCjk from '../src/index'

describe('@comark/cjk', () => {
  describe('plugin export', () => {
    it('should export a valid ComarkPlugin', async () => {
      const cjk = comarkCjk()
      expect(cjk).toBeDefined()
      expect(cjk.markdownItPlugins).toBeDefined()
      expect(Array.isArray(cjk.markdownItPlugins)).toBe(true)
      expect(cjk.markdownItPlugins?.length).toBe(1)
    })

    it('should have markdownItPlugins as functions', async () => {
      const cjk = comarkCjk()
      for (const plugin of (cjk.markdownItPlugins || [])) {
        expect(typeof plugin).toBe('function')
      }
    })
  })

  describe('CJK text parsing', () => {
    it('should parse Chinese text correctly', async () => {
      const cjk = comarkCjk()
      const result = await parse('这是一段中文文本。', { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0]).toEqual(['p', {}, '这是一段中文文本。'])
    })

    it('should parse Japanese text correctly', async () => {
      const cjk = comarkCjk()
      const result = await parse('これは日本語のテキストです。', { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0]).toEqual(['p', {}, 'これは日本語のテキストです。'])
    })

    it('should parse Korean text correctly', async () => {
      const cjk = comarkCjk()
      const result = await parse('이것은 한국어 텍스트입니다.', { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0]).toEqual(['p', {}, '이것은 한국어 텍스트입니다.'])
    })

    it('should handle mixed CJK and Latin text', async () => {
      const cjk = comarkCjk()
      const result = await parse('Hello 世界！', { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0]).toEqual(['p', {}, 'Hello 世界！'])
    })

    it('should handle CJK with markdown formatting', async () => {
      const cjk = comarkCjk()
      const result = await parse('**加粗文本** 和 *斜体文本*', { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const p = result.nodes[0] as any[]
      expect(p[0]).toBe('p')
      expect(p).toContainEqual(['strong', {}, '加粗文本'])
      expect(p).toContainEqual(['em', {}, '斜体文本'])
    })
  })

  describe('CJK line breaking', () => {
    it('should handle line breaks in CJK text without adding extra spaces', async () => {
      const input = `这是第一行
这是第二行`
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const p = result.nodes[0] as any[]
      expect(p[0]).toBe('p')
      // CJK-friendly plugin should not add space between lines
      const text = p.slice(2).join('')
      expect(text).not.toContain(' 这是第二行')
    })

    it('should handle line breaks between CJK and Latin text appropriately', async () => {
      const input = `Hello
世界`
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
    })

    it('should handle soft line breaks in CJK text', async () => {
      // CJK-friendly plugin handles soft line breaks appropriately
      const input = `第一行
第二行`
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const p = result.nodes[0] as any[]
      expect(p[0]).toBe('p')
      // Text content should contain both lines
      const textContent = p.slice(2).join('')
      expect(textContent).toContain('第一行')
      expect(textContent).toContain('第二行')
    })
  })

  describe('CJK with Comark components', () => {
    it('should parse Comark component with CJK content', async () => {
      const input = `::alert
这是一个警告消息。
::`
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const alert = result.nodes[0] as any[]
      expect(alert[0]).toBe('alert')
    })

    it('should parse Comark component with CJK props', async () => {
      const input = `::card{title="卡片标题"}
卡片内容
::`
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const card = result.nodes[0] as any[]
      expect(card[0]).toBe('card')
      expect(card[1].title).toBe('卡片标题')
    })

    it('should handle inline component with CJK', async () => {
      const input = '这是一个 :badge[徽章] 组件。'
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const p = result.nodes[0] as any[]
      expect(p[0]).toBe('p')
      expect(p.some(child => Array.isArray(child) && child[0] === 'badge')).toBe(true)
    })
  })

  describe('CJK headings', () => {
    it('should parse CJK headings', async () => {
      const cjk = comarkCjk()
      const result = await parse('# 中文标题', { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const h1 = result.nodes[0] as any[]
      expect(h1[0]).toBe('h1')
      expect(h1[2]).toBe('中文标题')
    })

    it('should generate correct ID for CJK headings', async () => {
      const cjk = comarkCjk()
      const result = await parse('## 日本語の見出し', { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const h2 = result.nodes[0] as any[]
      expect(h2[0]).toBe('h2')
      expect(h2[1].id).toBeDefined()
    })

    it('should handle mixed language headings', async () => {
      const cjk = comarkCjk()
      const result = await parse('### Hello 你好 こんにちは', { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const h3 = result.nodes[0] as any[]
      expect(h3[0]).toBe('h3')
    })
  })

  describe('CJK lists', () => {
    it('should parse CJK unordered list', async () => {
      const input = `- 第一项
- 第二项
- 第三项`
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const ul = result.nodes[0] as any[]
      expect(ul[0]).toBe('ul')
    })

    it('should parse CJK ordered list', async () => {
      const input = `1. 第一步
2. 第二步
3. 第三步`
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const ol = result.nodes[0] as any[]
      expect(ol[0]).toBe('ol')
    })
  })

  describe('CJK code blocks', () => {
    it('should preserve CJK in inline code', async () => {
      const cjk = comarkCjk()
      const result = await parse('使用 `代码` 标签', { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const p = result.nodes[0] as any[]
      expect(p[0]).toBe('p')
      expect(p.some(child => Array.isArray(child) && child[0] === 'code')).toBe(true)
    })

    it('should preserve CJK in code blocks', async () => {
      const input = `\`\`\`
// 中文注释
const msg = "你好世界"
\`\`\``
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const pre = result.nodes[0] as any[]
      expect(pre[0]).toBe('pre')
    })
  })

  describe('CJK blockquotes', () => {
    it('should parse CJK blockquote', async () => {
      const input = `> 这是一段引用文本。
> 来自某位名人。`
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const blockquote = result.nodes[0] as any[]
      expect(blockquote[0]).toBe('blockquote')
    })
  })

  describe('CJK tables', () => {
    it('should parse CJK table', async () => {
      const input = `| 名称 | 描述 |
|------|------|
| 项目A | 这是项目A |
| 项目B | 这是项目B |`
      const cjk = comarkCjk()
      const result = await parse(input, { plugins: [cjk] })
      expect(result.nodes).toHaveLength(1)
      const table = result.nodes[0] as any[]
      expect(table[0]).toBe('table')
    })
  })

  describe('comparison with and without plugin', () => {
    it('should handle CJK text consistently', async () => {
      const input = '中文文本 English text 日本語'
      const cjk = comarkCjk()
      const withPlugin = await parse(input, { plugins: [cjk] })
      const withoutPlugin = await parse(input)
      // Both should produce valid output
      expect(withPlugin.nodes).toHaveLength(1)
      expect(withoutPlugin.nodes).toHaveLength(1)
    })
  })
})
