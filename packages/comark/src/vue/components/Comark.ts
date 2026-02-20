import type { PropType } from 'vue'
import { computed, defineComponent, h, shallowRef, watch } from 'vue'
import type { ComarkTree } from '../../ast/types'
import { parse } from '../../index'
import type { ParseOptions, ComponentManifest } from '../../types'
import { ComarkRenderer } from './ComarkRenderer'

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
      default: undefined,
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
      type: Function as PropType<ComponentManifest>,
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
    summary: {
      type: Boolean as PropType<boolean>,
      default: false,
    },

    /**
     * If caret is true, a caret will be appended to the last text node in the tree
     */
    caret: {
      type: [Boolean, Object] as PropType<boolean | { class: string }>,
      default: false,
    },
  },

  async setup(props, ctx) {
    const markdown = computed(() => {
      let result = props.markdown
      const childrent = ctx.slots.default?.()
      if (childrent && childrent.length > 0 && typeof childrent[0].children === 'string') {
        result = childrent[0].children!
      }
      if (props.summary) {
        result = result?.split('<!-- more -->')[0]
      }
      return (result || '').trim()
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
      // Render using ComarkRenderer
      return h(ComarkRenderer, {
        tree: parsed.value || { nodes: [], frontmatter: {}, meta: {} },
        components: components.value,
        streaming: props.streaming,
        componentsManifest: props.componentsManifest,
        class: `comark-content ${props.streaming ? 'comark-stream' : ''}`,
        caret: props.caret,
      })
    }
  },
})
