import React from 'react'
import { MarkdownDocument } from './MarkdownDocument.tsx'
import type { MarkdownDocumentProps } from './MarkdownDocument.tsx'
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
export const ComarkRenderer: React.FC<ComarkRendererProps> = (props) => {
  warnDeprecated('ComarkRenderer', 'MarkdownDocument')
  return React.createElement(MarkdownDocument, props)
}

ComarkRenderer.displayName = 'ComarkRenderer'
