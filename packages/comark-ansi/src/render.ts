import type { ElementNode, MarkdownDocument, Node, RendererOptions } from 'comark'
import { render } from 'comark/render'
import { handlers as defaultHandlers } from './handlers/index.ts'
import { stripControlChars } from './utils/escape.ts'

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
 * The renderer concatenates node text, code bodies and hrefs into terminal
 * output, so any control byte in the parsed document reaches the TTY. Strip
 * them (keeping \t and \n) before rendering — returns a copy, the input
 * document is not mutated.
 */
function sanitizeForTerminal(nodes: Node[]): Node[] {
  return nodes.map((node): Node => {
    if (typeof node === 'string') return stripControlChars(node)
    if (node[0] === null) {
      // Comment node — [null, attrs, content]
      return [null, node[1], stripControlChars(String((node as unknown[])[2] ?? ''))] as Node
    }
    const [tag, attrs, ...children] = node as ElementNode
    const cleanAttrs: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(attrs)) {
      cleanAttrs[key] = typeof value === 'string' ? stripControlChars(value) : value
    }
    return [tag, cleanAttrs, ...sanitizeForTerminal(children as Node[])] as Node
  })
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

  const sanitized = { ...document, nodes: sanitizeForTerminal(document.nodes) }
  return render(sanitized, {
    ...options,
    colors,
    width,
    components: {
      ...defaultHandlers,
      ...options?.components,
    },
  })
}
