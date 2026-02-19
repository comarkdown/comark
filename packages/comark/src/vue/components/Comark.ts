import type { PropType } from 'vue'
import { computed, defineComponent, h, shallowRef, watch } from 'vue'
import type { ComarkTree } from '../../ast/types'
import { parse } from '../../index'
import type { ParseOptions } from '../../types'
import { ComarkAst } from './ComarkAst'

/**
 * Comark component
 *
 * Comark component that accepts markdown as a string prop,
 * parses it, and renders it.
 *
 * @example
 * ```vue
 * <template>
 *   <Comark :markdown="content" :components="customComponents" />
 * </template>
 *
 * <script setup lang="ts">
 * import { Comark } from 'comark/vue'
 * import CustomHeading from './CustomHeading.vue'
 *
 * const content = `
 * # Hello World
 *
 * This is a **markdown** document with components.
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
export const Comark = defineComponent({
  name: 'Comark',

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

    /**
     * Enable streaming mode with stream-specific components
     */
    streaming: {
      type: Boolean as PropType<boolean>,
      default: false,
    },

    /**
     * If document has a <!-- more --> comment, only render the content before the comment
     */
    excerpt: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },

  async setup(props) {
    const markdown = computed(() => {
      if (props.excerpt) {
        return props.markdown.split('<!-- more -->')[0]
      }
      return props.markdown
    })

    const parsed = shallowRef<ComarkTree | null>(null)
    const streamComponents = shallowRef<Record<string, any>>()
    const components = computed(() => ({
      ...streamComponents.value,
      ...props.components,
    }))

    async function parseMarkdown() {
      parsed.value = await parse(markdown.value, {
        ...props.options,
      })
    }

    watch(markdown, parseMarkdown)

    await parseMarkdown()

    return () => {
      // Render using ComarkAst
      return h(ComarkAst, {
        body: parsed.value || { nodes: [], frontmatter: {}, meta: {} },
        components: components.value,
        streaming: props.streaming,
        componentsManifest: props.componentsManifest,
        class: `comark-content ${props.streaming ? 'comark-stream' : ''}`,
      })
    }
  },
})
