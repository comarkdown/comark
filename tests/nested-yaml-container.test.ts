import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'
import { parseWithRemark } from './utils'

describe('nested Container with YAML and Code Block', () => {
  const markdown = `::container{padding="0px"}
  :::container
  ---
  styles: |
    pre {
      border: 1px solid red !important;

      span {
        line-height: 1;
      }
    }
  ---
  This container has a code block.

  \`\`\`
  function test() {
    // console.log("test");
  }
  \`\`\`
  :::
::`

  it('should parse with parse', () => {
    const result = parse(markdown)
    // console.log('MarkdownIt result:', JSON.stringify(result.body, null, 2))

    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)

    // Find the outer container
    const outerContainer = result.body.children.find((c: any) => c.tag === 'container')
    expect(outerContainer).toBeDefined()
    expect(outerContainer.props).toHaveProperty('padding', '0px')

    // Should have nested container
    const nestedContainer = outerContainer.children.find((c: any) => c.tag === 'container')
    expect(nestedContainer).toBeDefined()

    // Nested container should have YAML props
    expect(nestedContainer.props).toBeDefined()
    const hasStyles = 'styles' in nestedContainer.props
    expect(hasStyles).toBe(true)

    // Should contain paragraph with text
    const paragraph = nestedContainer.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    // Should contain code block
    const pre = nestedContainer.children.find((c: any) => c.tag === 'pre')
    expect(pre).toBeDefined()
  })

  it('should parse with parseWithRemark', () => {
    const result = parseWithRemark(markdown)
    // console.log('Remark result:', JSON.stringify(result.body, null, 2))

    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)

    // Find the outer container
    const outerContainer = result.body.children.find((c: any) => c.tag === 'container')
    expect(outerContainer).toBeDefined()
    expect(outerContainer.props).toHaveProperty('padding', '0px')

    // Should have nested container
    const nestedContainer = outerContainer.children.find((c: any) => c.tag === 'container')
    expect(nestedContainer).toBeDefined()

    // Nested container should have YAML props
    expect(nestedContainer.props).toBeDefined()
    const hasStyles = 'styles' in nestedContainer.props
    expect(hasStyles).toBe(true)

    // Should contain paragraph with text
    const paragraph = nestedContainer.children.find((c: any) => c.tag === 'p')
    expect(paragraph).toBeDefined()

    // Should contain code block
    const pre = nestedContainer.children.find((c: any) => c.tag === 'pre')
    expect(pre).toBeDefined()
  })

  it('should produce same structure with both parsers', () => {
    const resultMarkdownIt = parse(markdown)
    const resultRemark = parseWithRemark(markdown)

    // Both should have outer container
    const outerContainerMd = resultMarkdownIt.body.children.find((c: any) => c.tag === 'container')
    const outerContainerRm = resultRemark.body.children.find((c: any) => c.tag === 'container')

    expect(outerContainerMd).toBeDefined()
    expect(outerContainerRm).toBeDefined()

    // Both should have padding prop
    expect(outerContainerMd.props.padding).toBe('0px')
    expect(outerContainerRm.props.padding).toBe('0px')

    // Both should have nested container
    const nestedMd = outerContainerMd.children.find((c: any) => c.tag === 'container')
    const nestedRm = outerContainerRm.children.find((c: any) => c.tag === 'container')

    expect(nestedMd).toBeDefined()
    expect(nestedRm).toBeDefined()

    // Both should have styles in YAML props
    expect('styles' in nestedMd.props).toBe(true)
    expect('styles' in nestedRm.props).toBe(true)

    // Both should have code blocks
    const preMd = nestedMd.children.find((c: any) => c.tag === 'pre')
    const preRm = nestedRm.children.find((c: any) => c.tag === 'pre')

    expect(preMd).toBeDefined()
    expect(preRm).toBeDefined()
  })
})
