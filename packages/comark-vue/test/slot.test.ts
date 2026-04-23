import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { renderSlot } from '../src/utils/slot.ts'

/**
 * Tests for the `renderSlot` runtime utility, which powers the
 * `<slot unwrap="div" />` Comark feature.
 *
 * The Vite transformer replaces the standard `renderSlot`
 * call with this custom version at compile time. These tests validate
 * the runtime behavior directly without needing the Vite transform.
 */
describe('renderSlot with unwrap prop', () => {
  it('unwraps the slot content div when unwrap="div"', async () => {
    const TestComponent = defineComponent({
      setup(_, { slots }) {
        return () => renderSlot(slots, 'default', { unwrap: 'div' })
      },
    })

    const app = createSSRApp({
      setup() {
        return () =>
          h(TestComponent, null, {
            default: () => h('div', {}, [h('p', {}, 'Hello World')]),
          })
      },
    })

    const html = await renderToString(app as any)
    expect(html).toContain('Hello World')
    expect(html).toContain('<p>')
    // The wrapping div should be removed
    expect(html).not.toMatch(/<div[^>]*>/)
  })

  it('preserves slot content unchanged when no unwrap prop', async () => {
    const TestComponent = defineComponent({
      setup(_, { slots }) {
        return () => renderSlot(slots, 'default', {})
      },
    })

    const app = createSSRApp({
      setup() {
        return () =>
          h(TestComponent, null, {
            default: () => h('div', {}, [h('p', {}, 'Hello World')]),
          })
      },
    })

    const html = await renderToString(app as any)
    expect(html).toContain('<div>')
    expect(html).toContain('<p>')
    expect(html).toContain('Hello World')
  })

  it('also unwraps when comarkUnwrap prop is used', async () => {
    const TestComponent = defineComponent({
      setup(_, { slots }) {
        return () => renderSlot(slots, 'default', { comarkUnwrap: 'div' })
      },
    })

    const app = createSSRApp({
      setup() {
        return () =>
          h(TestComponent, null, {
            default: () => h('div', {}, [h('p', {}, 'Content')]),
          })
      },
    })

    const html = await renderToString(app as any)
    expect(html).toContain('Content')
    expect(html).not.toMatch(/<div[^>]*>/)
  })

  it('unwraps multiple levels with space-separated tags', async () => {
    const TestComponent = defineComponent({
      setup(_, { slots }) {
        return () => renderSlot(slots, 'default', { unwrap: 'div p' })
      },
    })

    const app = createSSRApp({
      setup() {
        return () =>
          h(TestComponent, null, {
            default: () => h('div', {}, [h('p', {}, 'Bare text')]),
          })
      },
    })

    const html = await renderToString(app as any)
    expect(html).toContain('Bare text')
    expect(html).not.toMatch(/<div[^>]*>/)
    expect(html).not.toMatch(/<p[^>]*>/)
  })

  it('falls back to standard renderSlot when named slot is absent', async () => {
    const TestComponent = defineComponent({
      setup(_, { slots }) {
        // 'missing' slot is not provided — should fall through to standard rendering
        return () => renderSlot(slots, 'missing', { unwrap: 'div' }, () => 'fallback')
      },
    })

    const app = createSSRApp({
      setup() {
        return () =>
          h(TestComponent, null, {
            default: () => h('p', 'provided slot'),
          })
      },
    })

    const html = await renderToString(app as any)
    expect(html).toContain('fallback')
  })
})
