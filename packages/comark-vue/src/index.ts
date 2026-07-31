import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { Markdown } from './components/Markdown.ts'
import type { MarkdownDocument as MarkdownDocumentType, ComponentManifest, ParserOptions } from 'comark'
import { MarkdownDocument } from './components/MarkdownDocument.ts'
import { warnDeprecated } from './internal/deprecation.ts'

export { Markdown } from './components/Markdown.ts'
export type { MarkdownProps } from './components/Markdown.ts'
export { MarkdownDocument } from './components/MarkdownDocument.ts'
export type { MarkdownDocumentProps } from './components/MarkdownDocument.ts'

// Deprecated aliases — will be removed in a future major version
/** @deprecated Use `MarkdownDocument` instead */
export { MarkdownDocument as MarkdownParsed } from './components/MarkdownDocument.ts'
/** @deprecated Use `MarkdownDocumentProps` instead */
export type { MarkdownDocumentProps as MarkdownParsedProps } from './components/MarkdownDocument.ts'
export { Comark } from './components/Comark.ts'
export type { ComarkProps } from './components/Comark.ts'
export { ComarkRenderer } from './components/ComarkRenderer.ts'
export type { ComarkRendererProps } from './components/ComarkRenderer.ts'

export type * from 'comark'

interface DefineMarkdownComponentOptions extends ParserOptions {
  extends?: typeof Markdown
  name?: string
  components?: Record<string, any>
  /**
   * Additional classes for the wrapper div
   */
  class?: string
}

interface DefineMarkdownDocumentOptions {
  extends?: typeof MarkdownDocument
  name?: string
  components?: Record<string, any>
  /**
   * Additional classes for the wrapper div
   */
  class?: string
}

export function defineMarkdownComponent(config: DefineMarkdownComponentOptions = {}): typeof Markdown {
  const { name, ...parseOptions } = config

  return defineComponent({
    name: name ?? 'MarkdownComponent',
    props: {
      /**
       * The markdown content to parse and render
       */
      value: {
        type: String as PropType<string>,
        default: undefined,
      },

      /**
       * The markdown content to parse and render
       * @deprecated Use `value` instead
       */
      markdown: {
        type: String as PropType<string>,
        default: undefined,
      },

      /**
       * Parser options
       */
      options: {
        type: Object as PropType<Exclude<ParserOptions, 'plugins'>>,
        default: () => ({}),
      },

      /**
       * Additional plugins to use
       */
      plugins: {
        type: Array as PropType<ParserOptions['plugins']>,
        default: () => [],
      },

      /**
       * Strip wrapper tags from the top level of the tree — shorthand for
       * `options.unwrap`. `true` unwraps `<p>`; a space-separated string or
       * array unwraps the listed tags.
       */
      unwrap: {
        type: [Boolean, String, Array] as PropType<boolean | string | string[]>,
        default: false,
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
        const component = config.extends || Markdown
        return h(
          component,
          {
            value: props.value ?? props.markdown,
            options: options.value,
            plugins: plugins.value,
            unwrap: props.unwrap,
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

export function defineMarkdownDocumentComponent(config: DefineMarkdownDocumentOptions = {}): typeof MarkdownDocument {
  return defineComponent({
    name: config.name ?? 'MarkdownDocumentComponent',
    props: {
      /**
       * The parsed Comark tree to render
       */
      value: {
        type: Object as PropType<MarkdownDocumentType>,
        default: undefined,
      },

      /**
       * The parsed Comark tree to render
       * @deprecated Use `value` instead
       */
      tree: {
        type: Object as PropType<MarkdownDocumentType>,
        default: undefined,
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
        const component = config.extends || MarkdownDocument
        return h(
          component,
          {
            value: props.value ?? props.tree,
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

/**
 * @deprecated Use `defineMarkdownComponent` instead.
 */
export function defineComarkComponent(config: DefineMarkdownComponentOptions = {}): typeof Markdown {
  warnDeprecated('defineComarkComponent', 'defineMarkdownComponent')
  return defineMarkdownComponent(config)
}

/**
 * @deprecated Use `defineMarkdownDocumentComponent` instead.
 */
export function defineMarkdownParsedComponent(config: DefineMarkdownDocumentOptions = {}): typeof MarkdownDocument {
  warnDeprecated('defineMarkdownParsedComponent', 'defineMarkdownDocumentComponent')
  return defineMarkdownDocumentComponent(config)
}

/**
 * @deprecated Use `defineMarkdownDocumentComponent` instead.
 */
export function defineComarkRendererComponent(config: DefineMarkdownDocumentOptions = {}): typeof MarkdownDocument {
  warnDeprecated('defineComarkRendererComponent', 'defineMarkdownDocumentComponent')
  return defineMarkdownDocumentComponent(config)
}
