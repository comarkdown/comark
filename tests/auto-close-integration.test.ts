import { describe, expect, it } from 'vitest'
import { autoCloseMarkdown, detectUnclosedSyntax, parse } from '../src/index'

describe('autoCloseMarkdown - Integration with parser', () => {
  it('should parse auto-closed bold syntax correctly', () => {
    const input = '**bold text'
    const closed = autoCloseMarkdown(input)
    const result = parse(closed)

    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)

    // Should have a paragraph with strong element
    const paragraph = result.body.children[0]
    expect(paragraph.type).toBe('element')
    expect(paragraph.tag).toBe('p')
  })

  it('should parse auto-closed component correctly', () => {
    const input = '::alert{type="info"}\nThis is important'
    const closed = autoCloseMarkdown(input)
    const result = parse(closed)

    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)

    // Should have an alert component
    const alert = result.body.children[0]
    expect(alert.type).toBe('element')
    expect(alert.tag).toBe('alert')
  })

  it('should handle streaming scenario - accumulating chunks', () => {
    const chunks = [
      '# Title\n\n',
      '::card\n',
      'Some **bold',
      ' text**\n',
      '::',
    ]

    let accumulated = ''
    const results = []

    // Simulate streaming by accumulating chunks
    for (const chunk of chunks) {
      accumulated += chunk
      const closed = autoCloseMarkdown(accumulated)
      const parsed = parse(closed)
      results.push({ accumulated, closed, parsed })
    }

    // Check first chunk - just heading
    expect(results[0].parsed.body.children.length).toBeGreaterThan(0)
    expect(results[0].parsed.body.children[0].tag).toBe('h1')

    // Check last chunk - fully formed
    const final = results[results.length - 1]
    expect(final.parsed.body.children.some((child: any) => child.tag === 'card')).toBe(true)
  })

  it('should handle nested components in streaming', () => {
    const chunks = [
      ':::outer\n',
      '::inner\n',
      'Content',
      '\n::\n',
      ':::',
    ]

    let accumulated = ''

    for (const chunk of chunks) {
      accumulated += chunk
      const closed = autoCloseMarkdown(accumulated)
      const parsed = parse(closed)

      // Should always parse successfully
      expect(parsed.body.type).toBe('root')
    }
  })

  it('should detect and report unclosed syntax', () => {
    const examples = [
      { input: '**bold', expectedInline: ['**bold**'], expectedComponents: 0 },
      { input: '::card\ntext', expectedInline: [], expectedComponents: 1 },
      { input: '::card\n**bold', expectedInline: ['**bold**'], expectedComponents: 1 },
    ]

    for (const example of examples) {
      const detection = detectUnclosedSyntax(example.input)

      if (example.expectedInline.length > 0) {
        expect(detection.hasUnclosed).toBe(true)
        expect(detection.unclosedInline.length).toBeGreaterThan(0)
      }

      expect(detection.unclosedComponents.length).toBe(example.expectedComponents)
    }
  })

  it('should work with mixed content and auto-close appropriately', () => {
    const input = `# Real-world Example

::alert{type="warning"}
This is a **bold statement

Some text with \`code`

    const closed = autoCloseMarkdown(input)
    const result = parse(closed)

    // Should parse without errors
    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)

    // Should have heading
    expect(result.body.children.some((child: any) => child.tag === 'h1')).toBe(true)

    // Should have alert component
    expect(result.body.children.some((child: any) => child.tag === 'alert')).toBe(true)
  })

  it('should not modify already valid markdown', () => {
    const validInputs = [
      '**bold** text',
      '::card\nContent\n::',
      '# Heading',
      'Plain text',
      ':::outer\n::inner\n::\n:::',
    ]

    for (const input of validInputs) {
      const closed = autoCloseMarkdown(input)
      expect(closed).toBe(input)
    }
  })
})
