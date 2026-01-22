import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

describe('code Blocks', () => {
  it('should parse simple code block without language', () => {
    const markdown = '```\nconst x = 1;\n```'

    const result = parse(markdown)
    // console.log('Simple code block:', JSON.stringify(result.body, null, 2))

    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)

    // Find the pre element
    const pre = result.body.children.find((c: any) => c.tag === 'pre')
    expect(pre).toBeDefined()

    // Should have code element inside
    const code = pre.children.find((c: any) => c.tag === 'code')
    expect(code).toBeDefined()

    // Should have text content
    const textNode = code.children.find((c: any) => c.type === 'text')
    expect(textNode).toBeDefined()
    expect(textNode.value).toContain('const x = 1')
  })

  it('should parse code block with language', () => {
    const markdown = '```javascript\nconst x = 1;\n```'

    const result = parse(markdown)
    // console.log('Code block with language:', JSON.stringify(result.body, null, 2))

    const pre = result.body.children.find((c: any) => c.tag === 'pre')
    expect(pre).toBeDefined()

    const code = pre.children.find((c: any) => c.tag === 'code')
    expect(code).toBeDefined()

    // Should have language indicator
    expect(code.props).toBeDefined()
    const hasLanguage = code.props.class?.includes('javascript')
      || code.props.class?.includes('language-javascript')
      || code.props.language === 'javascript'
    expect(hasLanguage).toBe(true)

    // Should have text content
    const textNode = code.children.find((c: any) => c.type === 'text')
    expect(textNode).toBeDefined()
    expect(textNode.value).toContain('const x = 1')
  })

  it('should treat escaped newlines as inline code', () => {
    const markdown = '```javascript\\nconst x = 1;\\n```'

    const result = parse(markdown)

    // console.log('Escaped newlines (inline code):', JSON.stringify(result.body, null, 2))

    // Escaped newlines are treated as inline code in a paragraph, not a code block
    const paragraph = result.body.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    const code = paragraph.children.find((c: any) => c.tag === 'code')
    expect(code).toBeDefined()

    // Should have text content with the escaped newlines as literal text
    const textNode = code.children.find((c: any) => c.type === 'text')
    expect(textNode).toBeDefined()
    expect(textNode.value).toContain('javascript')
    expect(textNode.value).toContain('const x = 1')
  })

  it('should parse code block with multiple lines', () => {
    const markdown = `\`\`\`javascript
function hello() {
  // console.log("Hello World");
  return true;
}
\`\`\``

    const result = parse(markdown)
    // console.log('Multi-line code block:', JSON.stringify(result.body, null, 2))
    // console.log('Multi-line code block remark:', JSON.stringify(parseWithRemark(markdown).body, null, 2))

    const pre = result.body.children.find((c: any) => c.tag === 'pre')
    expect(pre).toBeDefined()

    const code = pre.children.find((c: any) => c.tag === 'code')
    expect(code).toBeDefined()

    const textNode = code.children.find((c: any) => c.type === 'text')
    expect(textNode).toBeDefined()
    expect(textNode.value).toContain('function hello')
    expect(textNode.value).toContain('console.log')
    expect(textNode.value).toContain('return true')
  })

  it('should parse code block with special characters', () => {
    const markdown = '```javascript\nconst str = "Hello <world> & friends";\n```'

    const result = parse(markdown)

    const pre = result.body.children.find((c: any) => c.tag === 'pre')
    expect(pre).toBeDefined()

    const code = pre.children.find((c: any) => c.tag === 'code')
    expect(code).toBeDefined()

    const textNode = code.children.find((c: any) => c.type === 'text')
    expect(textNode).toBeDefined()
    expect(textNode.value).toContain('<world>')
    expect(textNode.value).toContain('&')
  })

  it('should parse inline code', () => {
    const markdown = 'This is `inline code` in text.'

    const result = parse(markdown)
    // console.log('Inline code:', JSON.stringify(result.body, null, 2))

    const paragraph = result.body.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    const code = paragraph.children.find((c: any) => c.tag === 'code')
    expect(code).toBeDefined()

    const textNode = code.children.find((c: any) => c.type === 'text')
    expect(textNode).toBeDefined()
    expect(textNode.value).toBe('inline code')
  })

  it('should parse multiple code blocks in sequence', () => {
    const markdown = `\`\`\`javascript
const x = 1;
\`\`\`

\`\`\`python
y = 2
\`\`\``

    const result = parse(markdown)

    const preElements = result.body.children.filter((c: any) => c.tag === 'pre')
    expect(preElements).toHaveLength(2)

    // First code block should be javascript
    const code1 = preElements[0].children.find((c: any) => c.tag === 'code')
    expect(code1).toBeDefined()
    const hasJs = code1.props.class?.includes('javascript')
      || code1.props.class?.includes('language-javascript')
    expect(hasJs).toBe(true)

    // Second code block should be python
    const code2 = preElements[1].children.find((c: any) => c.tag === 'code')
    expect(code2).toBeDefined()
    const hasPy = code2.props.class?.includes('python')
      || code2.props.class?.includes('language-python')
    expect(hasPy).toBe(true)
  })

  it('should parse code block with empty lines', () => {
    const markdown = `\`\`\`javascript
function test() {

  return true;
}
\`\`\``

    const result = parse(markdown)

    const pre = result.body.children.find((c: any) => c.tag === 'pre')
    expect(pre).toBeDefined()

    const code = pre.children.find((c: any) => c.tag === 'code')
    expect(code).toBeDefined()

    const textNode = code.children.find((c: any) => c.type === 'text')
    expect(textNode).toBeDefined()
    // Empty line should be preserved
    expect(textNode.value).toContain('\n\n')
  })

  it('should parse code block inside MDC component', () => {
    const markdown = `::card
\`\`\`javascript
const x = 1;
\`\`\`
::`

    const result = parse(markdown)
    // console.log('Code block in component:', JSON.stringify(result.body, null, 2))

    const card = result.body.children.find((c: any) => c.tag === 'card')
    expect(card).toBeDefined()

    const pre = card.children.find((c: any) => c.tag === 'pre')
    expect(pre).toBeDefined()

    const code = pre.children.find((c: any) => c.tag === 'code')
    expect(code).toBeDefined()

    const textNode = code.children.find((c: any) => c.type === 'text')
    expect(textNode).toBeDefined()
    expect(textNode.value).toContain('const x = 1')
  })

  it('should handle code block with backticks in content', () => {
    const markdown = '````markdown\n```javascript\ncode\n```\n````'

    const result = parse(markdown)

    const pre = result.body.children.find((c: any) => c.tag === 'pre')
    expect(pre).toBeDefined()

    const code = pre.children.find((c: any) => c.tag === 'code')
    expect(code).toBeDefined()

    const textNode = code.children.find((c: any) => c.type === 'text')
    expect(textNode).toBeDefined()
    expect(textNode.value).toContain('```')
  })
})
