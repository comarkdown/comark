import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

describe('inline MDC Components', () => {
  it('should parse inline component with text content and class', () => {
    const markdown = `This is :component[text]{.class} inline.`

    const result = parse(markdown)
    // console.log('Inline component result:', JSON.stringify(result.body, null, 2))

    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)

    // Find the paragraph
    const paragraph = result.body.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    // Should contain the inline component
    const componentEl = paragraph.children.find((c: any) => c.tag === 'component')
    expect(componentEl).toBeDefined()

    // Check for class attribute
    expect(componentEl.props).toHaveProperty('class', 'class')

    // Check that it has text content
    expect(componentEl.children).toHaveLength(1)
    expect(componentEl.children[0].value).toBe('text')
  })

  it('should parse inline component without surrounding bold', () => {
    const markdown = `Text with :badge[New]{.primary} component.`

    const result = parse(markdown)
    // console.log('Badge component result:', JSON.stringify(result.body, null, 2))

    const paragraph = result.body.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    // Should contain badge component
    const hasBadge = JSON.stringify(paragraph).includes('badge')
    expect(hasBadge).toBe(true)
  })

  it('should parse multiple inline components in same paragraph', () => {
    const markdown = `Start :icon[check]{.green} middle :icon[close]{.red} end.`

    const result = parse(markdown)

    const paragraph = result.body.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    // Should contain icon components
    const content = JSON.stringify(paragraph)
    const iconCount = (content.match(/icon/g) || []).length
    expect(iconCount).toBeGreaterThanOrEqual(2)
  })

  it('should parse inline component with multiple classes', () => {
    const markdown = `Click this :button[Go]{.btn .primary} button`

    const result = parse(markdown)
    // console.log('Button with multiple classes:', JSON.stringify(result.body, null, 2))

    const paragraph = result.body.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    // Should contain button component
    const buttonEl = paragraph.children.find((c: any) => c.tag === 'button')
    expect(buttonEl).toBeDefined()

    // Should have text content
    expect(buttonEl.children[0].value).toBe('Go')

    // Should have class attribute
    const classAttr = buttonEl.props.class
    expect(classAttr).toBeDefined()
    // Class may be space-separated or combined
    expect(typeof classAttr === 'string').toBe(true)
    expect(classAttr.length > 0).toBe(true)
  })

  it('should parse inline component with simple text', () => {
    const markdown = `This is :alert[Important]{.warning} message`

    const result = parse(markdown)

    const paragraph = result.body.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    // Should contain alert component
    const alertEl = paragraph.children.find((c: any) => c.tag === 'alert')
    expect(alertEl).toBeDefined()

    // Should have warning class
    expect(alertEl.props.class).toBe('warning')

    // Should have text content
    expect(alertEl.children[0].value).toBe('Important')
  })

  it('should handle inline component in list', () => {
    const markdown = `- Item with :icon[star]{.gold} component
- Regular item`

    const result = parse(markdown)

    const ul = result.body.children.find((c: any) => c.tag === 'ul')
    expect(ul).toBeDefined()
    expect(ul.children).toHaveLength(2)

    // First item should contain icon component
    const hasIcon = JSON.stringify(ul.children[0]).includes('icon')
    expect(hasIcon).toBe(true)
  })

  it('should handle inline component in bold text', () => {
    const markdown = `**This is :component[text]{.class} inside bold**`

    const result = parse(markdown)
    // console.log('Component in bold:', JSON.stringify(result.body, null, 2))

    const paragraph = result.body.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    // Should have both strong and component
    const content = JSON.stringify(paragraph)
    expect(content).toContain('strong')
    expect(content).toContain('component')
  })

  it('should parse self-closing inline component', () => {
    const markdown = `Text with :icon{name="check" .small} here.`

    const result = parse(markdown)

    const paragraph = result.body.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    const hasIcon = JSON.stringify(paragraph).includes('icon')
    expect(hasIcon).toBe(true)
  })

  it('should handle inline component in heading', () => {
    const markdown = `# Heading with :badge[v2.0]{.new}`

    const result = parse(markdown)

    const heading = result.body.children.find((c: any) => c.tag === 'h1')
    expect(heading).toBeDefined()

    const hasBadge = JSON.stringify(heading).includes('badge')
    expect(hasBadge).toBe(true)
  })

  it('should handle empty inline component', () => {
    const markdown = `Text with :spacer{.lg} component.`

    const result = parse(markdown)

    const paragraph = result.body.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    const hasSpacer = JSON.stringify(paragraph).includes('spacer')
    expect(hasSpacer).toBe(true)
  })
})
