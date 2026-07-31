import { defineComponent, h } from 'vue'
import { Markdown } from './Markdown.ts'
import type { MarkdownProps } from './Markdown.ts'
import { warnDeprecated } from '../internal/deprecation.ts'

/**
 * Props for the Comark component
 * @deprecated Use `MarkdownProps` instead
 */
export type ComarkProps = MarkdownProps

/**
 * Comark component
 *
 * @deprecated Use `Markdown` instead — same component, renamed to describe
 * what it renders. `Comark` will be removed in a future major version.
 */
export const Comark: typeof Markdown = defineComponent({
  name: 'Comark',
  inheritAttrs: false,

  setup(_props, ctx) {
    warnDeprecated('Comark', 'Markdown')
    return () => h(Markdown, ctx.attrs, ctx.slots)
  },
}) as typeof Markdown
