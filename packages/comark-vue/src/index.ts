import { computed, defineComponent, h } from 'vue'
import { Markdown, markdownProps } from './components/Markdown.ts'
import type { NodeTransform, ParserOptions } from 'comark'
import { mergeNodeTransforms } from 'comark/utils'
import { MarkdownDocument, markdownDocumentProps } from './components/MarkdownDocument.ts'

export { Markdown } from './components/Markdown.ts'
export type { MarkdownProps } from './components/Markdown.ts'
export { MarkdownDocument } from './components/MarkdownDocument.ts'
export type { MarkdownDocumentProps } from './components/MarkdownDocument.ts'

export type * from 'comark'

interface DefineMarkdownComponentOptions extends ParserOptions {
  extends?: typeof Markdown
  name?: string
  components?: Record<string, any>
  /**
   * Node transforms that run before the instance's own `transformNode`
   */
  transformNode?: NodeTransform | readonly NodeTransform[]
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
   * Node transforms that run before the instance's own `transformNode`
   */
  transformNode?: NodeTransform | readonly NodeTransform[]
  /**
   * Additional classes for the wrapper div
   */
  class?: string
}

export function defineMarkdownComponent(config: DefineMarkdownComponentOptions = {}): typeof Markdown {
  const { name, transformNode, ...parseOptions } = config

  return defineComponent({
    name: name ?? 'MarkdownComponent',
    props: markdownProps,
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

      const transforms = computed(() => mergeNodeTransforms(transformNode, props.transformNode))

      return () => {
        const component = config.extends || Markdown
        // Spread rather than list every prop: the hand-written list had drifted
        // from `<Markdown>` three times, dropping `data` and `documentKey`.
        return h(
          component,
          {
            ...props,
            options: options.value,
            plugins: plugins.value,
            components: components.value,
            transformNode: transforms.value,
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
    props: markdownDocumentProps,
    setup(props, { slots }) {
      const components = computed(() => ({
        ...config.components,
        ...props.components,
      }))

      const transforms = computed(() => mergeNodeTransforms(config.transformNode, props.transformNode))

      return () => {
        const component = config.extends || MarkdownDocument
        return h(
          component,
          {
            ...props,
            components: components.value,
            transformNode: transforms.value,
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
