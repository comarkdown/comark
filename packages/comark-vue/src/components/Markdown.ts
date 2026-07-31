import type { PropType } from 'vue'
import { computed, defineComponent, h, shallowRef, watch } from 'vue'
import { createSerializedParse } from 'comark'
import type { ParseOptions, ComponentManifest, MarkdownDocument as MarkdownDocumentType } from 'comark'
import { isMarkdownDocument } from 'comark/utils'
import { MarkdownDocument } from './MarkdownDocument.ts'
import { warnDeprecated } from '../internal/deprecation.ts'

/**
 * Props for the Markdown component
 */
export interface MarkdownProps {
  /**
   * The markdown content to parse and render, or a pre-parsed MarkdownDocument
   */
  value?: string | MarkdownDocumentType

  /**
   * The markdown content to parse and render
   * @deprecated Use `value` instead
   */
  markdown?: string

  /**
   * Parser options (excluding plugins)
   */
  options?: Exclude<ParseOptions, 'plugins'>

  /**
   * Additional plugins to use
   */
  plugins?: ParseOptions['plugins']

  /**
   * Strip wrapper tags from the top level of the tree — shorthand for
   * `options.unwrap`. `true` unwraps `<p>` (single-line rendering); a
   * space-separated string or array unwraps the listed tags. Useful for inline
   * usage like `<UButton><Markdown :value="text" unwrap /></UButton>`.
   */
  unwrap?: boolean | string | string[]

  /**
   * Custom component mappings for element tags
   */
  components?: Record<string, any>

  /**
   * Dynamic component resolver function
   */
  componentsManifest?: ComponentManifest

  /**
   * Enable streaming mode with stream-specific components
   */
  streaming?: boolean

  /**
   * If document has a <!-- more --> comment, only render the content before the comment
   */
  summary?: boolean

  /**
   * If caret is true, a caret will be appended to the last text node in the tree
   */
  caret?: boolean | { class: string }

  /**
   * Additional data to pass to the renderer
   */
  data?: Record<string, unknown>
}

type MarkdownComponent = ReturnType<typeof defineComponent<MarkdownProps>>

/**
 * Markdown component
 *
 * Accepts raw markdown as a string prop, parses it, and renders it.
 *
 * @example
 * ```vue
 * <template>
 *   <Markdown :value="content" :components="customComponents" />
 * </template>
 *
 * <script setup lang="ts">
 * import { Markdown } from '@comark/vue'
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
export const Markdown: MarkdownComponent = defineComponent({
  name: 'Markdown',

  props: {
    /**
     * The markdown content to parse and render, or a pre-parsed MarkdownDocument
     */
    value: {
      type: [String, Object] as PropType<string | MarkdownDocumentType>,
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
     * Strip wrapper tags from the top level of the tree — shorthand for
     * `options.unwrap`. `true` unwraps `<p>`; a space-separated string or array
     * unwraps the listed tags.
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

    /**
     * Additional data to pass to the renderer
     */
    data: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
  },

  async setup(props, ctx) {
    if (props.markdown !== undefined && props.value === undefined) {
      warnDeprecated('markdown (prop)', 'value')
    }

    const markdown = computed(() => {
      if (isMarkdownDocument(props.value)) return ''
      let result = (props.value as string | undefined) ?? props.markdown
      const childrent = ctx.slots.default?.()
      if (childrent && childrent.length > 0 && typeof childrent[0].children === 'string') {
        result = childrent[0].children!
      }
      if (props.summary) {
        result = result?.split('<!-- more -->')[0]
      }
      return (result || '').trim()
    })

    const parsed = shallowRef<MarkdownDocumentType | null>(null)

    const parse = createSerializedParse({
      ...props.options,
      // `unwrap` prop is a shorthand for the `unwrap` parse option; an explicit
      // `options.unwrap` still wins when the prop is left at its default.
      ...(props.unwrap ? { unwrap: props.unwrap } : {}),
      plugins: props.plugins,
    })

    watch(
      () => [markdown.value, props.streaming] as const,
      () => {
        if (isMarkdownDocument(props.value)) return
        parse(markdown.value, { streaming: props.streaming }).then((result) => (parsed.value = result))
      }
    )

    if (!isMarkdownDocument(props.value)) {
      await parse(markdown.value, { streaming: props.streaming }).then((result) => (parsed.value = result))
    }

    return () => {
      // Pre-parsed tree — skip parse and render directly
      if (isMarkdownDocument(props.value)) {
        return h(MarkdownDocument, {
          value: props.value,
          components: props.components,
          streaming: props.streaming,
          componentsManifest: props.componentsManifest,
          class: props.streaming ? 'comark-stream' : '',
          caret: props.caret,
          data: props.data,
        })
      }

      // Render using MarkdownDocument
      return h(MarkdownDocument, {
        value: parsed.value || { nodes: [], frontmatter: {}, meta: {} },
        components: props.components,
        streaming: props.streaming,
        componentsManifest: props.componentsManifest,
        class: props.streaming ? 'comark-stream' : '',
        caret: props.caret,
        data: props.data,
      })
    }
  },
})
