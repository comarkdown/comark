import { describe, expect, it } from 'vitest'
import { parse } from 'comark'
import { createMathPlugin } from '../src/index'

const mathPlugin = createMathPlugin()

describe('createMathPlugin', () => {
  it('should create a plugin with default config', () => {
    const plugin = createMathPlugin()
    expect(plugin).toBeDefined()
    expect(plugin.markdownItPlugins).toBeDefined()
    expect(plugin.markdownItPlugins?.length).toBeGreaterThan(0)
  })

  it('should create a plugin with custom config', () => {
    const plugin = createMathPlugin()
    expect(plugin).toBeDefined()
  })
})

describe('markdown-it integration', () => {
  it('should parse inline math', () => {
    const result = parse('The formula $x^2$ is simple', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math')
    expect(ast).toContain('math inline')
    expect(ast).toContain('x^2')
  })

  it('should parse display math on single line', () => {
    const result = parse('Display: $$E = mc^2$$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math')
    expect(ast).toContain('math inline') // Inline $$...$$ creates inline tokens with display mode
    expect(ast).toContain('E = mc^2')
  })

  it('should parse multiline display math', () => {
    const markdown = `Formula:
$$
x^2 + y^2 = z^2
$$`
    const result = parse(markdown, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math')
    expect(ast).toContain('math block')
    expect(ast).toContain('x^2 + y^2 = z^2')
  })

  it('should parse multiple inline math expressions', () => {
    const result = parse('Both $x^2$ and $y^2$ are squared', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('x^2')
    expect(ast).toContain('y^2')
    expect((ast.match(/math inline/g) || []).length).toBeGreaterThanOrEqual(2)
  })

  it('should parse mixed inline and display math', () => {
    const markdown = `Inline $x^2$ and display:
$$
E = mc^2
$$`
    const result = parse(markdown, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math inline')
    expect(ast).toContain('math block')
    expect(ast).toContain('x^2')
    expect(ast).toContain('E = mc^2')
  })

  it('should handle text without math', () => {
    const text = 'No math here'
    const result = parse(text, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).not.toContain('"math"') // Check for the math tag, not the word
  })

  it('should not parse single dollar signs', () => {
    const text = 'Price is $100 or $200'
    const result = parse(text, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('$100')
    expect(ast).toContain('$200')
    expect(ast).not.toContain('"math"')
  })

  it('should handle fractions in inline math', () => {
    const result = parse('The ratio $\\frac{a}{b}$ is important', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math inline')
    expect(ast).toContain('\\frac{a}{b}')
  })

  it('should handle complex display math', () => {
    const markdown = `$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$`
    const result = parse(markdown, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math block')
    expect(ast).toContain('\\int')
    expect(ast).toContain('\\frac')
  })
})

describe('complex math expressions', () => {
  it('should handle quadratic formula', () => {
    const result = parse('$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math')
    expect(ast).toContain('\\frac')
    expect(ast).toContain('\\sqrt')
  })

  it('should handle summations', () => {
    const result = parse('$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math')
    expect(ast).toContain('\\sum')
  })

  it('should handle matrices', () => {
    const result = parse('$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math')
    expect(ast).toContain('pmatrix')
  })

  it('should handle limits', () => {
    const result = parse('$\\lim_{x \\to \\infty} f(x)$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math')
    expect(ast).toContain('\\lim')
  })
})

describe('edge cases', () => {
  it('should handle empty inline math', () => {
    const result = parse('Empty $$', { plugins: [mathPlugin] })
    expect(result.body.value).toBeDefined()
  })

  it('should handle math in headings', () => {
    const result = parse('# Formula $E = mc^2$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math inline')
    expect(ast).toContain('E = mc^2')
  })

  it('should handle math in lists', () => {
    const markdown = `- Item with $x^2$
- Another with $y^2$`
    const result = parse(markdown, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math inline')
    expect(ast).toContain('x^2')
    expect(ast).toContain('y^2')
  })

  it('should handle math in blockquotes', () => {
    const result = parse('> Quote with $x^2$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('math inline')
    expect(ast).toContain('x^2')
  })

  it('should not parse math in code blocks', () => {
    const markdown = '```\n$x^2$\n```'
    const result = parse(markdown, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    // The $ should appear but not as a math token
    expect(ast).toContain('$x^2$')
    expect(ast).not.toContain('"math"')
  })

  it('should not parse math in inline code', () => {
    const result = parse('Code `$x^2$` here', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result.body)
    // Should contain the code element but not math
    expect(ast).toContain('code')
    expect(ast).toContain('$x^2$')
    expect(ast).not.toContain('"math"')
  })
})
