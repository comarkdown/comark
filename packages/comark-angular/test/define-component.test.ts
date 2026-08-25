import { describe, expect, it } from 'vitest'
import { defineMarkdownComponent, defineMarkdownDocumentComponent } from '../src/define.ts'

describe('defineMarkdownComponent', () => {
  it('returns a component class', () => {
    const Defined = defineMarkdownComponent({})
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
      plugins: [fakePlugin as any],
    })
    expect(Defined).toBeDefined()
  })

  it('accepts components in config', () => {
    class FakeComponent {}
    const Defined = defineMarkdownComponent({
      components: { alert: FakeComponent as any },
    })
    expect(Defined).toBeDefined()
  })

  it('accepts class in config', () => {
    const Defined = defineMarkdownComponent({
      class: 'prose dark:prose-invert',
    })
    expect(Defined).toBeDefined()
  })

  it('accepts parse options in config', () => {
    const Defined = defineMarkdownComponent({
      autoClose: true,
      linkify: true,
    })
    expect(Defined).toBeDefined()
  })
})

describe('defineMarkdownDocumentComponent', () => {
  it('returns a component class', () => {
    const Defined = defineMarkdownDocumentComponent({})
    expect(Defined).toBeDefined()
    expect(typeof Defined).toBe('function')
  })

  it('returns a component class with default config', () => {
    const Defined = defineMarkdownDocumentComponent()
    expect(Defined).toBeDefined()
  })

  it('accepts components in config', () => {
    class FakeComponent {}
    const Defined = defineMarkdownDocumentComponent({
      components: { Math: FakeComponent as any },
    })
    expect(Defined).toBeDefined()
  })

  it('accepts class in config', () => {
    const Defined = defineMarkdownDocumentComponent({
      class: 'prose',
    })
    expect(Defined).toBeDefined()
  })
})
