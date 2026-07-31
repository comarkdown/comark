import { describe, expect, it } from 'vitest'
import { defineMarkdownComponent, defineMarkdownParsedComponent } from '../src/define.ts'

describe('defineMarkdownComponent', () => {
  it('returns a component class', () => {
    const Defined = defineMarkdownComponent({ name: 'test-comark' })
    expect(Defined).toBeDefined()
    expect(typeof Defined).toBe('function')
  })

  it('returns a component class with default config', () => {
    const Defined = defineMarkdownComponent()
    expect(Defined).toBeDefined()
    expect(typeof Defined).toBe('function')
  })

  it('accepts plugins in config', () => {
    const fakePlugin = { name: 'test', setup: () => {} }
    const Defined = defineMarkdownComponent({
      name: 'with-plugins',
      plugins: [fakePlugin as any],
    })
    expect(Defined).toBeDefined()
  })

  it('accepts components in config', () => {
    class FakeComponent {}
    const Defined = defineMarkdownComponent({
      name: 'with-components',
      components: { alert: FakeComponent as any },
    })
    expect(Defined).toBeDefined()
  })

  it('accepts class in config', () => {
    const Defined = defineMarkdownComponent({
      name: 'with-class',
      class: 'prose dark:prose-invert',
    })
    expect(Defined).toBeDefined()
  })

  it('accepts parse options in config', () => {
    const Defined = defineMarkdownComponent({
      name: 'with-options',
      html: true,
      autoClose: true,
    })
    expect(Defined).toBeDefined()
  })
})

describe('defineMarkdownParsedComponent', () => {
  it('returns a component class', () => {
    const Defined = defineMarkdownParsedComponent({ name: 'test-renderer' })
    expect(Defined).toBeDefined()
    expect(typeof Defined).toBe('function')
  })

  it('returns a component class with default config', () => {
    const Defined = defineMarkdownParsedComponent()
    expect(Defined).toBeDefined()
  })

  it('accepts components in config', () => {
    class FakeComponent {}
    const Defined = defineMarkdownParsedComponent({
      name: 'renderer-with-components',
      components: { Math: FakeComponent as any },
    })
    expect(Defined).toBeDefined()
  })

  it('accepts class in config', () => {
    const Defined = defineMarkdownParsedComponent({
      name: 'renderer-with-class',
      class: 'prose',
    })
    expect(Defined).toBeDefined()
  })
})
