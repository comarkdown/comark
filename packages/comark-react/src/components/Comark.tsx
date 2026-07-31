import { Markdown } from './Markdown.tsx'
import type { MarkdownProps } from './Markdown.tsx'
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
export function Comark(props: ComarkProps) {
  warnDeprecated('Comark', 'Markdown')
  return Markdown(props)
}
