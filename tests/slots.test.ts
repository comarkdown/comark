import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

describe('slots in MDC Components', () => {
  it('should parse component with named slots', () => {
    const markdown = `::multi-slot-test
Default content here

#header
Header slot content

#footer
Footer slot content
::`

    const result = parse(markdown)
    // console.log('Slots test result:', JSON.stringify(result, null, 2))

    expect(result.body.type).toBe('root')
    expect(result.body.children.length).toBeGreaterThan(0)

    const component = result.body.children.find((c: any) => c.tag === 'multi-slot-test')
    expect(component).toBeDefined()
    // console.log('Component:', JSON.stringify(component, null, 2))
  })

  it('should parse component with only named slots', () => {
    const markdown = `::callout
#title
Please be careful!
#default
Using MDC & Vue components is addictive.
::`

    const result = parse(markdown)
    // console.log('Callout test result:', JSON.stringify(result, null, 2))

    const component = result.body.children.find((c: any) => c.tag === 'callout')
    expect(component).toBeDefined()
    // console.log('Callout component:', JSON.stringify(component, null, 2))
  })
})
