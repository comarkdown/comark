import { describe, expect, it } from 'vitest'
import { defineComarkComponent, defineComarkRendererComponent } from '../src/define.ts'

describe('defineComarkComponent', () => {
  it('returns a component class', () => {
    const Defined = defineComarkComponent({ name: 'test-comark' })
    expect(Defined).toBeDefined()
    expect(typeof Defined).toBe('function')
  })

  it('returns a component class with default config', () => {
    const Defined = defineComarkComponent()
    expect(Defined).toBeDefined()
    expect(typeof Defined).toBe('function')
  })

  it('accepts plugins in config', () => {
    const fakePlugin = { name: 'test', setup: () => {} }
    const Defined = defineComarkComponent({
      name: 'with-plugins',
      plugins: [fakePlugin as any],
    })
    expect(Defined).toBeDefined()
  })

  it('accepts components in config', () => {
    class FakeComponent {}
    const Defined = defineComarkComponent({
      name: 'with-components',
      components: { alert: FakeComponent as any },
    })
    expect(Defined).toBeDefined()
  })

  it('accepts class in config', () => {
    const Defined = defineComarkComponent({
      name: 'with-class',
      class: 'prose dark:prose-invert',
    })
    expect(Defined).toBeDefined()
  })

  it('accepts parse options in config', () => {
    const Defined = defineComarkComponent({
      name: 'with-options',
      html: true,
      autoClose: true,
    })
    expect(Defined).toBeDefined()
  })
})

describe('defineComarkRendererComponent', () => {
  it('returns a component class', () => {
    const Defined = defineComarkRendererComponent({ name: 'test-renderer' })
    expect(Defined).toBeDefined()
    expect(typeof Defined).toBe('function')
  })

  it('returns a component class with default config', () => {
    const Defined = defineComarkRendererComponent()
    expect(Defined).toBeDefined()
  })

  it('accepts components in config', () => {
    class FakeComponent {}
    const Defined = defineComarkRendererComponent({
      name: 'renderer-with-components',
      components: { Math: FakeComponent as any },
    })
    expect(Defined).toBeDefined()
  })

  it('accepts class in config', () => {
    const Defined = defineComarkRendererComponent({
      name: 'renderer-with-class',
      class: 'prose',
    })
    expect(Defined).toBeDefined()
  })
})
