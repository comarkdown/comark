import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { Comark } from './components/Comark.ts'
import type { ComarkTree, ComponentManifest, ParseOptions } from 'comark'
import { ComarkRenderer } from './components/ComarkRenderer.ts'

export { ComarkRenderer } from './components/ComarkRenderer.ts'
export { Comark } from './components/Comark.ts'
export type * from 'comark'

interface DefineComarkComponentOptions extends ParseOptions {
  extends?: typeof Comark
  name?: string
  components?: Record<string, any>
  /**
   * Additional classes for the wrapper div
   */
  class?: string
}

interface DefineComarkRendererOptions {
  extends?: typeof ComarkRenderer
  name?: string
  components?: Record<string, any>
  /**
   * Additional classes for the wrapper div
   */
  class?: string
}

export function defineComarkComponent(config: DefineComarkComponentOptions = {}): typeof Comark {
  const { name, ...parseOptions } = config

  return defineComponent({
    name: name ?? 'ComarkComponent',
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
        type: Object as PropType<Exclude<ParseOptions, 'plugins'>>,
        default: () => ({}),
      },

      /**
       * Additional plugins to use
       */
      plugins: {
        type: Array as PropType<ParseOptions['plugins']>,
        default: () => [],
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
    setup(props, { slots }) {
      const options = computed(() => ({
        ...parseOptions,
        ...props.options,
      }))

      const plugins = computed(() => [...(config.plugins || []), ...(props.plugins || [])])

      const components = computed(() => ({
        ...config.components,
        ...props.components,
      }))

      return () => {
        const component = config.extends || Comark
        return h(
          component,
          {
            markdown: props.markdown,
            options: options.value,
            plugins: plugins.value,
            components: components.value,
            componentsManifest: props.componentsManifest,
            streaming: props.streaming,
            summary: props.summary,
            caret: props.caret,
            class: config.class,
          },
          {
            default: slots.default,
          }
        )
      }
    },
  })
}

export function defineComarkRendererComponent(config: DefineComarkRendererOptions = {}): typeof ComarkRenderer {
  return defineComponent({
    name: config.name ?? 'ComarkRendererComponent',
    props: {
      /**
       * The Comark tree to render
       */
      tree: {
        type: Object as PropType<ComarkTree>,
        required: true,
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
       * If caret is true, a caret will be appended to the last text node in the tree
       */
      caret: {
        type: [Boolean, Object] as PropType<boolean | { class: string }>,
        default: false,
      },
    },
    setup(props, { slots }) {
      const components = computed(() => ({
        ...config.components,
        ...props.components,
      }))

      return () => {
        const component = config.extends || ComarkRenderer
        return h(
          component,
          {
            tree: props.tree,
            components: components.value,
            componentsManifest: props.componentsManifest,
            streaming: props.streaming,
            caret: props.caret,
            class: config.class,
          },
          {
            default: slots.default,
          }
        )
      }
    },
  })
}
