import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { parse } from '../../index'
import type { ParseOptions } from '../../types'
import { MDCRenderer } from './MDCRenderer'
import { standardProseComponents } from './prose/standard'
import { proseStreamComponents } from './prose/stream'

/**
 * MDC component
 *
 * High-level component that accepts markdown as a string prop,
 * parses it, and renders it using MDCRenderer.
 *
 * @example
 * ```vue
 * <template>
 *   <MDC :markdown="content" :components="customComponents" />
 * </template>
 *
 * <script setup lang="ts">
 * import { MDC } from 'mdc-syntax/vue'
 * import CustomHeading from './CustomHeading.vue'
 *
 * const content = `
 * # Hello World
 *
 * This is a **markdown** document with *MDC* components.
 *
 * ::alert{type="info"}
 * This is an alert component
 * ::
 * `
 *
 * const customComponents = {
 *   h1: CustomHeading,
 *   alert: AlertComponent,
 * }
 * </script>
 * ```
 */
export const MDC = defineComponent({
  name: 'MDC',

  props: {
    /**
     * The markdown content to parse and render
     */
    markdown: {
      type: String as PropType<string>,
      required: true,
    },

    /**
     * Parser options
     */
    options: {
      type: Object as PropType<ParseOptions>,
      default: () => ({}),
    },

    /**
     * Custom component mappings for element tags
     * Key: tag name (e.g., 'h1', 'p', 'MyComponent')
     * Value: Vue component
     */
    components: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },

    /**
     * Dynamic component resolver function
     * Used to resolve components that aren't in the components map
     */
    componentsManifest: {
      type: Function as PropType<(name: string) => Promise<any>>,
      default: undefined,
    },
  },

  setup(props) {
    // Parse the markdown content reactively
    const parsed = computed(() => {
      return parse(props.markdown, {
        ...props.options,
      })
    })

    return () => {
      // Render using MDCRenderer
      return h(MDCRenderer, {
        body: parsed.value.body,
        components: {
          ...standardProseComponents,
          ...proseStreamComponents,
          ...props.components,
        },
        componentsManifest: props.componentsManifest,
      })
    }
  },
})
