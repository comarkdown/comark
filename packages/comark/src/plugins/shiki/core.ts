import type { MarkdownDocument } from 'comark'
import type { ShikiPrimitive } from 'shiki'
import type { ShikiOptions } from '../../internal/shiki.ts'
import {
  createShikiPlugin,
  getHighlighter as getCoreHighlighter,
  highlightCodeBlocks as highlightCoreCodeBlocks,
} from '../../internal/shiki.ts'

export type { CodeBlockAttributes, HighlightOptions, ShikiOptions } from '../../internal/shiki.ts'
export { resetHighlighter } from '../../internal/shiki.ts'

export function getHighlighter(options: ShikiOptions = {}): Promise<ShikiPrimitive> {
  return getCoreHighlighter(options)
}

export function highlightCodeBlocks(tree: MarkdownDocument, options: ShikiOptions = {}): Promise<MarkdownDocument> {
  return highlightCoreCodeBlocks(tree, options)
}

export default createShikiPlugin()
