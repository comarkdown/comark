import { computed, defineComponent, h } from 'vue'
import { Markdown, markdownProps } from './components/Markdown.ts'
import type { NodeTransform, ParserOptions } from 'comark'
import { mergeNodeTransforms } from 'comark/utils'

export { Markdown } from './components/Markdown.ts'
export type { MarkdownProps } from './components/Markdown.ts'
export { MarkdownDocument, defineMarkdownDocumentComponent } from './components/MarkdownDocument.ts'
export type { DefineMarkdownDocumentOptions, MarkdownDocumentProps } from './components/MarkdownDocument.ts'

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
