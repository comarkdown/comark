import { describe, expect, it } from 'vitest'
import { parse } from 'comark'
import cjkPlugin from '../src/index'

describe('@comark/cjk', () => {
  describe('plugin export', () => {
    it('should export a valid ParsePlugin', () => {
      expect(cjkPlugin).toBeDefined()
      expect(cjkPlugin.markdownItPlugins).toBeDefined()
      expect(Array.isArray(cjkPlugin.markdownItPlugins)).toBe(true)
      expect(cjkPlugin.markdownItPlugins.length).toBe(1)
    })

    it('should have markdownItPlugins as functions', () => {
      for (const plugin of cjkPlugin.markdownItPlugins) {
        expect(typeof plugin).toBe('function')
      }
    })
  })

  describe('CJK text parsing', () => {
    it('should parse Chinese text correctly', () => {
      const result = parse('这是一段中文文本。', { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      expect(result.body.value[0]).toEqual(['p', {}, '这是一段中文文本。'])
    })

    it('should parse Japanese text correctly', () => {
      const result = parse('これは日本語のテキストです。', { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      expect(result.body.value[0]).toEqual(['p', {}, 'これは日本語のテキストです。'])
    })

    it('should parse Korean text correctly', () => {
      const result = parse('이것은 한국어 텍스트입니다.', { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      expect(result.body.value[0]).toEqual(['p', {}, '이것은 한국어 텍스트입니다.'])
    })

    it('should handle mixed CJK and Latin text', () => {
      const result = parse('Hello 世界！', { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      expect(result.body.value[0]).toEqual(['p', {}, 'Hello 世界！'])
    })

    it('should handle CJK with markdown formatting', () => {
      const result = parse('**加粗文本** 和 *斜体文本*', { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const p = result.body.value[0] as any[]
      expect(p[0]).toBe('p')
      expect(p).toContainEqual(['strong', {}, '加粗文本'])
      expect(p).toContainEqual(['em', {}, '斜体文本'])
    })
  })

  describe('CJK line breaking', () => {
    it('should handle line breaks in CJK text without adding extra spaces', () => {
      const input = `这是第一行
这是第二行`
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const p = result.body.value[0] as any[]
      expect(p[0]).toBe('p')
      // CJK-friendly plugin should not add space between lines
      const text = p.slice(2).join('')
      expect(text).not.toContain(' 这是第二行')
    })

    it('should handle line breaks between CJK and Latin text appropriately', () => {
      const input = `Hello
世界`
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
    })

    it('should handle soft line breaks in CJK text', () => {
      // CJK-friendly plugin handles soft line breaks appropriately
      const input = `第一行
第二行`
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const p = result.body.value[0] as any[]
      expect(p[0]).toBe('p')
      // Text content should contain both lines
      const textContent = p.slice(2).join('')
      expect(textContent).toContain('第一行')
      expect(textContent).toContain('第二行')
    })
  })

  describe('CJK with Comark components', () => {
    it('should parse Comark component with CJK content', () => {
      const input = `::alert
这是一个警告消息。
::`
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const alert = result.body.value[0] as any[]
      expect(alert[0]).toBe('alert')
    })

    it('should parse Comark component with CJK props', () => {
      const input = `::card{title="卡片标题"}
卡片内容
::`
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const card = result.body.value[0] as any[]
      expect(card[0]).toBe('card')
      expect(card[1].title).toBe('卡片标题')
    })

    it('should handle inline component with CJK', () => {
      const input = '这是一个 :badge[徽章] 组件。'
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const p = result.body.value[0] as any[]
      expect(p[0]).toBe('p')
      expect(p.some(child => Array.isArray(child) && child[0] === 'badge')).toBe(true)
    })
  })

  describe('CJK headings', () => {
    it('should parse CJK headings', () => {
      const result = parse('# 中文标题', { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const h1 = result.body.value[0] as any[]
      expect(h1[0]).toBe('h1')
      expect(h1[2]).toBe('中文标题')
    })

    it('should generate correct ID for CJK headings', () => {
      const result = parse('## 日本語の見出し', { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const h2 = result.body.value[0] as any[]
      expect(h2[0]).toBe('h2')
      expect(h2[1].id).toBeDefined()
    })

    it('should handle mixed language headings', () => {
      const result = parse('### Hello 你好 こんにちは', { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const h3 = result.body.value[0] as any[]
      expect(h3[0]).toBe('h3')
    })
  })

  describe('CJK lists', () => {
    it('should parse CJK unordered list', () => {
      const input = `- 第一项
- 第二项
- 第三项`
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const ul = result.body.value[0] as any[]
      expect(ul[0]).toBe('ul')
    })

    it('should parse CJK ordered list', () => {
      const input = `1. 第一步
2. 第二步
3. 第三步`
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const ol = result.body.value[0] as any[]
      expect(ol[0]).toBe('ol')
    })
  })

  describe('CJK code blocks', () => {
    it('should preserve CJK in inline code', () => {
      const result = parse('使用 `代码` 标签', { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const p = result.body.value[0] as any[]
      expect(p[0]).toBe('p')
      expect(p.some(child => Array.isArray(child) && child[0] === 'code')).toBe(true)
    })

    it('should preserve CJK in code blocks', () => {
      const input = `\`\`\`
// 中文注释
const msg = "你好世界"
\`\`\``
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const pre = result.body.value[0] as any[]
      expect(pre[0]).toBe('pre')
    })
  })

  describe('CJK blockquotes', () => {
    it('should parse CJK blockquote', () => {
      const input = `> 这是一段引用文本。
> 来自某位名人。`
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const blockquote = result.body.value[0] as any[]
      expect(blockquote[0]).toBe('blockquote')
    })
  })

  describe('CJK tables', () => {
    it('should parse CJK table', () => {
      const input = `| 名称 | 描述 |
|------|------|
| 项目A | 这是项目A |
| 项目B | 这是项目B |`
      const result = parse(input, { plugins: [cjkPlugin] })
      expect(result.body.value).toHaveLength(1)
      const table = result.body.value[0] as any[]
      expect(table[0]).toBe('table')
    })
  })

  describe('comparison with and without plugin', () => {
    it('should handle CJK text consistently', () => {
      const input = '中文文本 English text 日本語'
      const withPlugin = parse(input, { plugins: [cjkPlugin] })
      const withoutPlugin = parse(input)

      // Both should produce valid output
      expect(withPlugin.body.value).toHaveLength(1)
      expect(withoutPlugin.body.value).toHaveLength(1)
    })
  })
})
