import type { HeadingIdsOption, MarkdownDocument, RendererOptions } from '../types.ts'
import { createState, one } from '../internal/stringify/state.ts'
import { handlers } from '../internal/stringify/handlers/index.ts'

export interface MarkdownRendererOptions extends RendererOptions {
  /** The `headingIds` mode the document was parsed with. See `renderMarkdown` in `comark/render`. */
  headingIds?: HeadingIdsOption
  /** Always `markdown/html`. Use `render` from `comark/render` for other formats. */
  format?: never
}

/**
 * Render a document's nodes to CommonMark and GFM without loading YAML support.
 * Nodes with no Markdown syntax, such as components, are written as HTML, and
 * frontmatter is left out. Otherwise the output matches `renderMarkdown` from
 * `comark/render`, which keeps component syntax and frontmatter.
 *
 * @example
 * ```typescript
 * import { parseMarkdown } from 'comark'
 * import { renderMarkdown } from 'comark/render/markdown'
 *
 * const document = await parseMarkdown('# Hello **World**')
 * const markdown = await renderMarkdown(document)
 * ```
 */
export async function renderMarkdown(
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options: MarkdownRendererOptions = {}
): Promise<string> {
  const state = createState(handlers, {
    ...options,
    format: 'markdown/html',
    tree: document as MarkdownDocument,
    handlers: options.components,
  })
  let result = ''
  for (const node of document.nodes) result += await one(node, state)
  return result.trim()
}
