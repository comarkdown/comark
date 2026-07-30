import React from 'react'
import { MarkdownParsed } from './MarkdownParsed.tsx'
import type { MarkdownParsedProps } from './MarkdownParsed.tsx'
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
export const ComarkRenderer: React.FC<ComarkRendererProps> = (props) => {
  warnDeprecated('ComarkRenderer', 'MarkdownParsed')
  return React.createElement(MarkdownParsed, props)
}

ComarkRenderer.displayName = 'ComarkRenderer'
