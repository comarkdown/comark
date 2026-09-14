/**
 * Browser-only paginated preview entry point.
 *
 * Uses paged.js `Previewer` to paginate the current document content into a target
 * container element, producing `.pagedjs_page` wrappers that reflect how the document
 * will look when printed.
 *
 * Requires the `pagedjs` optional peer to be installed.
 *
 * @example
 * ```typescript
 * import { paginate } from '@comark/pdf/preview'
 *
 * const container = document.getElementById('preview')
 * const flow = await paginate(container)
 * console.log(`Rendered ${flow.total} pages`)
 * ```
 */

/**
 * Paginate document content into a target container element using paged.js.
 *
 * @param target - The DOM element to render pages into.
 * @param stylesheets - Optional array of extra CSS strings to apply.
 * @param content - Optional HTML string to paginate. When omitted, paged.js reads the current document body.
 * @returns A paged.js flow object with `total` page count.
 */
export const paginate = async (
  target: Element,
  stylesheets: string[] = [],
  content?: string,
): Promise<{ total: number }> => {
  const { Previewer } = await import('pagedjs')
  const previewer = new Previewer()
  return previewer.preview(content, stylesheets, target)
}
