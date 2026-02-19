import { describe, expect, it } from 'vitest'
import { parse } from 'comark'
import comarkMath from '../src/index'

const mathPlugin = comarkMath()

describe('comarkMath', () => {
  it('should create a plugin with default config', async () => {
    const plugin = comarkMath()
    expect(plugin).toBeDefined()
    expect(plugin.markdownItPlugins).toBeDefined()
    expect(plugin.markdownItPlugins?.length).toBeGreaterThan(0)
  })

  it('should create a plugin with custom config', async () => {
    const plugin = comarkMath()
    expect(plugin).toBeDefined()
  })
})

describe('markdown-it integration', () => {
  it('should parse inline math', async () => {
    const result = await parse('The formula $x^2$ is simple', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math')
    expect(ast).toContain('math inline')
    expect(ast).toContain('x^2')
  })

  it('should parse display math on single line', async () => {
    const result = await parse('Display: $$E = mc^2$$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math')
    expect(ast).toContain('math inline') // Inline $$...$$ creates inline tokens with display mode
    expect(ast).toContain('E = mc^2')
  })

  it('should parse multiline display math', async () => {
    const markdown = `Formula:
$$
x^2 + y^2 = z^2
$$`
    const result = await parse(markdown, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math')
    expect(ast).toContain('math block')
    expect(ast).toContain('x^2 + y^2 = z^2')
  })

  it('should parse multiple inline math expressions', async () => {
    const result = await parse('Both $x^2$ and $y^2$ are squared', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('x^2')
    expect(ast).toContain('y^2')
    expect((ast.match(/math inline/g) || []).length).toBeGreaterThanOrEqual(2)
  })

  it('should parse mixed inline and display math', async () => {
    const markdown = `Inline $x^2$ and display:
$$
E = mc^2
$$`
    const result = await parse(markdown, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math inline')
    expect(ast).toContain('math block')
    expect(ast).toContain('x^2')
    expect(ast).toContain('E = mc^2')
  })

  it('should handle text without math', async () => {
    const text = 'No math here'
    const result = await parse(text, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).not.toContain('"math"') // Check for the math tag, not the word
  })

  it('should not parse single dollar signs', async () => {
    const text = 'Price is $100 or $200'
    const result = await parse(text, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('$100')
    expect(ast).toContain('$200')
    expect(ast).not.toContain('"math"')
  })

  it('should handle fractions in inline math', async () => {
    const result = await parse('The ratio $\\frac{a}{b}$ is important', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math inline')
    expect(ast).toContain('\\frac{a}{b}')
  })

  it('should handle complex display math', async () => {
    const markdown = `$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$`
    const result = await parse(markdown, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math block')
    expect(ast).toContain('\\int')
    expect(ast).toContain('\\frac')
  })
})

describe('complex math expressions', () => {
  it('should handle quadratic formula', async () => {
    const result = await parse('$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math')
    expect(ast).toContain('\\frac')
    expect(ast).toContain('\\sqrt')
  })

  it('should handle summations', async () => {
    const result = await parse('$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math')
    expect(ast).toContain('\\sum')
  })

  it('should handle matrices', async () => {
    const result = await parse('$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math')
    expect(ast).toContain('pmatrix')
  })

  it('should handle limits', async () => {
    const result = await parse('$\\lim_{x \\to \\infty} f(x)$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math')
    expect(ast).toContain('\\lim')
  })
})

describe('edge cases', () => {
  it('should handle empty inline math', async () => {
    const result = await parse('Empty $$', { plugins: [mathPlugin] })
    expect(result.nodes).toBeDefined()
  })

  it('should handle math in headings', async () => {
    const result = await parse('# Formula $E = mc^2$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math inline')
    expect(ast).toContain('E = mc^2')
  })

  it('should handle math in lists', async () => {
    const markdown = `- Item with $x^2$
- Another with $y^2$`
    const result = await parse(markdown, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math inline')
    expect(ast).toContain('x^2')
    expect(ast).toContain('y^2')
  })

  it('should handle math in blockquotes', async () => {
    const result = await parse('> Quote with $x^2$', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('math inline')
    expect(ast).toContain('x^2')
  })

  it('should not parse math in code blocks', async () => {
    const markdown = '```\n$x^2$\n```'
    const result = await parse(markdown, { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    // The $ should appear but not as a math token
    expect(ast).toContain('$x^2$')
    expect(ast).not.toContain('"math"')
  })

  it('should not parse math in inline code', async () => {
    const result = await parse('Code `$x^2$` here', { plugins: [mathPlugin] })
    const ast = JSON.stringify(result)
    // Should contain the code element but not math
    expect(ast).toContain('code')
    expect(ast).toContain('$x^2$')
    expect(ast).not.toContain('"math"')
  })
})
