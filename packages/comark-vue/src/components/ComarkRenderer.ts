import { defineComponent, h } from 'vue'
import { MarkdownParsed } from './MarkdownParsed.ts'
import type { MarkdownParsedProps } from './MarkdownParsed.ts'
import { warnDeprecated } from '../internal/deprecation.ts'

/**
 * Props for the ComarkRenderer component
 * @deprecated Use `MarkdownParsedProps` instead
 */
export type ComarkRendererProps = MarkdownParsedProps

/**
 * ComarkRenderer component
 *
 * @deprecated Use `MarkdownParsed` instead — same component, renamed to
 * describe what it renders. `ComarkRenderer` will be removed in a future
 * major version.
 */
export const ComarkRenderer: typeof MarkdownParsed = defineComponent({
  name: 'ComarkRenderer',
  inheritAttrs: false,

  setup(_props, ctx) {
    warnDeprecated('ComarkRenderer', 'MarkdownParsed')
    return () => h(MarkdownParsed, ctx.attrs, ctx.slots)
  },
}) as typeof MarkdownParsed
