import type { ComarkTree } from './ast'
import { renderFrontmatter } from './internal/front-matter'
import { stringify } from './internal/stringify'

/**
 * Render Comark tree to HTML
 *
 * @param tree - The Comark tree to render
 * @returns The HTML string
 */
export function renderHTML(tree: ComarkTree): string {
  return stringify(tree, { format: 'text/html' }).trim()
}

/**
 * Render Comark tree to markdown
 *
 * @param tree - The Comark tree to render
 * @param data - The data to render
 * @returns
 */
export function renderMarkdown(tree: ComarkTree, data?: Record<string, any> | undefined | null): string {
  return renderFrontmatter(data, stringify(tree, { format: 'markdown/mdc' }))
}
