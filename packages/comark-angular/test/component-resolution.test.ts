import { describe, expect, it } from 'vitest'
import { pascalCase } from 'comark/utils'

/**
 * Tests the component resolution logic used by ComarkNodeComponent.
 * The resolution order is: Prose{PascalTag} > tag > PascalTag
 */
function resolveComponent(tag: string, components: Record<string, any>): any | undefined {
  const pascalTag = pascalCase(tag)
  const proseTag = `Prose${pascalTag}`
  return components[proseTag] || components[tag] || components[pascalTag]
}

describe('component resolution', () => {
  it('resolves by exact tag name', () => {
    const components = { alert: 'AlertComponent' }
    expect(resolveComponent('alert', components)).toBe('AlertComponent')
  })

  it('resolves by PascalCase tag name', () => {
    const components = { Alert: 'AlertComponent' }
    expect(resolveComponent('alert', components)).toBe('AlertComponent')
  })

  it('resolves Prose-prefixed component first', () => {
    const components = {
      h1: 'BasicH1',
      ProseH1: 'ProseH1Component',
    }
    expect(resolveComponent('h1', components)).toBe('ProseH1Component')
  })

  it('falls back to exact tag when Prose prefix not found', () => {
    const components = {
      h1: 'BasicH1',
    }
    expect(resolveComponent('h1', components)).toBe('BasicH1')
  })

  it('resolves hyphenated component names', () => {
    const components = { MyCard: 'MyCardComponent' }
    expect(resolveComponent('my-card', components)).toBe('MyCardComponent')
  })

  it('returns undefined for unregistered components', () => {
    const components = { alert: 'AlertComponent' }
    expect(resolveComponent('card', components)).toBeUndefined()
  })

  it('resolves ProseA for anchor tags', () => {
    const components = { ProseA: 'CustomLink' }
    expect(resolveComponent('a', components)).toBe('CustomLink')
  })

  it('resolves ProseImg for image tags', () => {
    const components = { ProseImg: 'CustomImage' }
    expect(resolveComponent('img', components)).toBe('CustomImage')
  })

  it('prefers Prose prefix over PascalCase', () => {
    const components = {
      Alert: 'PascalAlert',
      ProseAlert: 'ProseAlertComponent',
    }
    expect(resolveComponent('alert', components)).toBe('ProseAlertComponent')
  })
})
