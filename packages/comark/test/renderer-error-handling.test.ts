import { describe, expect, it, vi } from 'vitest'
import { computed, createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parse } from '../src/index'
import { ComarkAst } from '../src/vue/components/ComarkAst'

describe('ComarkAst Error Handling', () => {
  it('should handle component errors gracefully without crashing', async () => {
    const markdown = `::error-component
Some content
::`

    const result = await parse(markdown)

    // Define a component that throws an error
    const ErrorComponent = defineComponent({
      name: 'ErrorComponent',
      setup() {
        // This will throw during render
        throw new Error('Component error during render')
      },
    })

    // Spy on console.warn to verify error is logged
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const app = createSSRApp({
        setup() {
          return () => h(ComarkAst, {
            body: result,
            components: {
              'error-component': ErrorComponent,
            },
          })
        },
      })

      // Should not throw, but handle the error gracefully
      const html = await renderToString(app)

      // The renderer should still produce output (even if component failed)
      expect(html).toBeTruthy()
      expect(html).toContain('comark-content')

      // Verify error was captured and logged
      expect(warnSpy).toHaveBeenCalled()
    }
    finally {
      warnSpy.mockRestore()
    }
  })

  it('should handle components with required props during incomplete streaming', async () => {
    // Simulate incomplete YAML props during streaming
    const markdown = `::required-prop-test
::`

    const result = await parse(markdown)

    // Component with required prop that will error if prop is missing
    const RequiredPropTest = defineComponent({
      name: 'RequiredPropTest',
      props: {
        name: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        // This will throw if name is undefined
        const nameUpper = computed(() => props.name.toUpperCase())
        return () => h('div', {}, nameUpper.value)
      },
    })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const app = createSSRApp({
        setup() {
          return () => h(ComarkAst, {
            body: result,
            components: {
              'required-prop-test': RequiredPropTest,
            },
          })
        },
      })

      // Should handle missing required prop gracefully
      const html = await renderToString(app)

      expect(html).toBeTruthy()
      expect(html).toContain('comark-content')
    }
    finally {
      warnSpy.mockRestore()
    }
  })

  it('should continue rendering other components after one fails', async () => {
    const markdown = `::error-component
Error content
::

## Working Heading

::good-component
Good content
::`

    const result = await parse(markdown)

    const ErrorComponent = defineComponent({
      name: 'ErrorComponent',
      setup() {
        throw new Error('Component error')
      },
    })

    const GoodComponent = defineComponent({
      name: 'GoodComponent',
      setup(props, { slots }) {
        return () => h('div', { class: 'good-component' }, slots.default?.())
      },
    })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const app = createSSRApp({
        setup() {
          return () => h(ComarkAst, {
            body: result,
            components: {
              'error-component': ErrorComponent,
              'good-component': GoodComponent,
            },
          })
        },
      })

      const html = await renderToString(app)

      // Should still render the good component and heading
      expect(html).toContain('Working Heading')
      expect(html).toContain('good-component')
      expect(html).toContain('Good content')
    }
    finally {
      warnSpy.mockRestore()
    }
  })
})
