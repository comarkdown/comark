import type { MarkdownDocument } from 'comark'
import type { ShikiPrimitive } from 'shiki'
import type { ShikiOptions, ShikiThemeLoader } from '../internal/shiki.ts'
import {
  createShikiPlugin,
  getHighlighter as getCoreHighlighter,
  highlightCodeBlocks as highlightCoreCodeBlocks,
} from '../internal/shiki.ts'

export type { CodeBlockAttributes, HighlightOptions, ShikiOptions, ShikiThemeLoader } from '../internal/shiki.ts'
export { resetHighlighter } from '../internal/shiki.ts'

const defaultThemeLoaders: ShikiThemeLoader[] = [
  () => import('shiki/dist/themes/material-theme-lighter.mjs').then((module) => module.default),
  () => import('shiki/dist/themes/material-theme-palenight.mjs').then((module) => module.default),
]

export function getHighlighter(options: ShikiOptions = {}): Promise<ShikiPrimitive> {
  return getCoreHighlighter(options, defaultThemeLoaders)
}

export function highlightCodeBlocks(tree: MarkdownDocument, options: ShikiOptions = {}): Promise<MarkdownDocument> {
  return highlightCoreCodeBlocks(tree, options, defaultThemeLoaders)
}

export default createShikiPlugin(defaultThemeLoaders)
