import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

describe('yAML Props in MDC Components', () => {
  it('should parse YAML props and add them to component props', () => {
    const markdown = `::required-prop-test
---
name: John Doe
age: 30
---
::`

    const result = parse(markdown)
    // console.log('YAML Props result:', JSON.stringify(result.body, null, 2))

    expect(result.body.type).toBe('root')
    const component = result.body.children.find((c: any) => c.tag === 'required-prop-test')

    expect(component).toBeDefined()
    expect(component.props).toHaveProperty('name', 'John Doe')
    expect(component.props).toHaveProperty('age', '30')
  })

  it('should handle inline props with attributes', () => {
    const markdown = `::test-component{name="Alice" count="5"}
Content here
::`

    const result = parse(markdown)
    const component = result.body.children.find((c: any) => c.tag === 'test-component')

    expect(component).toBeDefined()
    expect(component.props).toHaveProperty('name', 'Alice')
    expect(component.props).toHaveProperty('count', '5')
  })
})
