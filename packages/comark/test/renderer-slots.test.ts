import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parse } from '../src/index'
import { ComarkAst } from '../src/vue/components/ComarkAst'

describe('ComarkAst with Slots', () => {
  it('should pass named slots to components', async () => {
    const markdown = `::test-component
Default content

#header
Header content

#footer
Footer content
::`

    const result = await parse(markdown)

    // Define a test component that uses slots
    const TestComponent = defineComponent({
      name: 'TestComponent',
      setup(props, { slots }) {
        return () => h('div', { class: 'test-component' }, [
          h('header', {}, slots.header?.()),
          h('main', {}, slots.default?.()),
          h('footer', {}, slots.footer?.()),
        ])
      },
    })

    // Create app with the renderer
    const app = createSSRApp({
      components: { ComarkAst },
      setup() {
        return () => h(ComarkAst, {
          body: result,
          components: {
            'test-component': TestComponent,
          },
        })
      },
    })

    const html = await renderToString(app)

    // Check that the HTML contains all slot content in the right places
    expect(html).toContain('test-component')
    expect(html).toContain('Header content')
    expect(html).toContain('Default content')
    expect(html).toContain('Footer content')

    // Verify structure: header should come before main, main before footer
    const headerIndex = html.indexOf('Header content')
    const defaultIndex = html.indexOf('Default content')
    const footerIndex = html.indexOf('Footer content')

    expect(headerIndex).toBeLessThan(defaultIndex)
    expect(defaultIndex).toBeLessThan(footerIndex)
  })

  it('should handle component with only named slots (no default)', async () => {
    const markdown = `::callout
#title
Warning Title
#description
This is a description
::`

    const result = await parse(markdown)

    const Callout = defineComponent({
      name: 'Callout',
      setup(props, { slots }) {
        return () => h('div', { class: 'callout' }, [
          h('h3', {}, slots.title?.()),
          h('p', {}, slots.description?.()),
        ])
      },
    })

    const app = createSSRApp({
      setup() {
        return () => h(ComarkAst, {
          body: result,
          components: {
            callout: Callout,
          },
        })
      },
    })

    const html = await renderToString(app)

    expect(html).toContain('Warning Title')
    expect(html).toContain('This is a description')
  })

  it('should handle component with mix of default and named slots', async () => {
    const markdown = `::multi-slot-test
**This is default content**

#header
This is header part

#footer
Copyright by Nuxt
::`

    const result = await parse(markdown)

    const MultiSlotTest = defineComponent({
      name: 'MultiSlotTest',
      setup(props, { slots }) {
        return () => h('div', { class: 'multi-slot' }, [
          h('div', { class: 'slot-header' }, slots.header?.()),
          h('div', { class: 'slot-default' }, slots.default?.()),
          h('div', { class: 'slot-footer' }, slots.footer?.()),
        ])
      },
    })

    const app = createSSRApp({
      setup() {
        return () => h(ComarkAst, {
          body: result,
          components: {
            'multi-slot-test': MultiSlotTest,
          },
        })
      },
    })

    const html = await renderToString(app)

    expect(html).toContain('This is default content')
    expect(html).toContain('This is header part')
    expect(html).toContain('Copyright by Nuxt')

    // Verify the HTML structure has the correct slot classes
    expect(html).toContain('slot-header')
    expect(html).toContain('slot-default')
    expect(html).toContain('slot-footer')
  })
})
