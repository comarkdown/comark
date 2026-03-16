import type { ComarkTree } from './ast/types.ts'
import { renderFrontmatter } from './internal/front-matter.ts'
import { stringify } from './internal/stringify/index.ts'

export { stringify } from './internal/stringify/index.ts'
export type { NodeHandler, State } from './internal/stringify/types'

export interface RenderMarkdownOptions {
  /**
   * Maximum number of inline attributes before switching to YAML block syntax.
   * Set to 0 to always use YAML block syntax.
   * @default 3
   */
  maxInlineAttributes?: number
}

/**
 * Render Comark tree to markdown
 *
 * @param tree - The Comark tree to render
 * @param options - Optional rendering options
 * @returns The markdown string with optional frontmatter
 */
export function renderMarkdown(tree: ComarkTree, options?: RenderMarkdownOptions): string {
  return renderFrontmatter(tree.frontmatter, stringify(tree, { format: 'markdown/mdc', ...options }))
}
