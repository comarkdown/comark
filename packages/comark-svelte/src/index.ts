export { default as Markdown } from './components/Markdown.svelte'
export { default as MarkdownParsed } from './components/MarkdownParsed.svelte'
export { default as MarkdownNode } from './components/MarkdownNode.svelte'
export type { MarkdownProps, MarkdownParsedProps, MarkdownNodeProps } from './types.js'

// Deprecated aliases — will be removed in a future major version
/** @deprecated Use `Markdown` instead */
export { default as Comark } from './components/Comark.svelte'
/** @deprecated Use `MarkdownParsed` instead */
export { default as ComarkRenderer } from './components/ComarkRenderer.svelte'
/** @deprecated Use `MarkdownNode` instead */
export { default as ComarkNode } from './components/ComarkNode.svelte'
export type { ComarkProps, ComarkRendererProps, ComarkNodeProps } from './types.js'

export type * from 'comark'
