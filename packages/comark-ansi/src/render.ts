import type { MarkdownDocument, RendererOptions } from 'comark'
import { render } from 'comark/render'
import { handlers as defaultHandlers } from './handlers/index.ts'

export * from 'comark/render'

export interface AnsiRendererOptions extends RendererOptions {
  /**
   * Whether to emit ANSI escape codes.
   * Defaults to `true` unless the `NO_COLOR` environment variable is set.
   */
  colors?: boolean
  /**
   * Terminal width used for horizontal rules and code block borders.
   * @default 80
   */
  width?: number
}

/**
 * Render a Markdown document to an ANSI-styled terminal string.
 *
 * @param document - The markdown document to render (parsed markdown)
 * @param options - Optional ANSI rendering options
 * @returns The ANSI-styled string
 *
 * @example
 * ```typescript
 * import { parseMarkdown } from 'comark'
 * import { renderAnsiFromDocument } from '@comark/ansi'
 *
 * const doc = await parseMarkdown('# Hello\n\nThis is **bold** and _italic_.')
 * console.log(await renderAnsiFromDocument(doc))
 * ```
 */
export async function renderAnsiFromDocument(
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: AnsiRendererOptions
): Promise<string> {
  const colors = options?.colors ?? (typeof process !== 'undefined' ? !process.env.NO_COLOR : true)
  const width = options?.width ?? 80

  return render(document, {
    ...options,
    colors,
    width,
    components: {
      ...defaultHandlers,
      ...options?.components,
    },
  })
}
