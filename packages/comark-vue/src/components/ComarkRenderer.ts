import { defineComponent, h } from 'vue'
import { MarkdownDocument } from './MarkdownDocument.ts'
import type { MarkdownDocumentProps } from './MarkdownDocument.ts'
import { warnDeprecated } from '../internal/deprecation.ts'

/**
 * Props for the ComarkRenderer component
 * @deprecated Use `MarkdownDocumentProps` instead
 */
export type ComarkRendererProps = MarkdownDocumentProps

/**
 * ComarkRenderer component
 *
 * @deprecated Use `MarkdownDocument` instead — same component, renamed to
 * describe what it renders. `ComarkRenderer` will be removed in a future
 * major version.
 */
export const ComarkRenderer: typeof MarkdownDocument = defineComponent({
  name: 'ComarkRenderer',
  inheritAttrs: false,

  setup(_props, ctx) {
    warnDeprecated('ComarkRenderer', 'MarkdownDocument')
    return () => h(MarkdownDocument, ctx.attrs, ctx.slots)
  },
}) as typeof MarkdownDocument
