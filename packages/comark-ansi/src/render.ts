import type { ComarkTree, RenderOptions } from 'comark'
import { render } from 'comark/render'
import { handlers as defaultHandlers } from './handlers/index.ts'

export * from 'comark/render'

export interface RenderANSIOptions extends RenderOptions {
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
 * Render a Comark tree to an ANSI-styled terminal string.
 *
 * @param tree - The Comark tree to render
 * @param options - Optional rendering options
 * @returns The ANSI-styled string
 *
 * @example
 * ```typescript
 * import { parse } from 'comark'
 * import { renderANSI } from '@comark/ansi'
 *
 * const tree = await parse('# Hello\n\nThis is **bold** and _italic_.')
 * console.log(renderANSI(tree))
 * ```
 */
export async function renderANSI(tree: ComarkTree, options?: RenderANSIOptions): Promise<string> {
  const colors = options?.colors ?? (typeof process !== 'undefined' ? !process.env.NO_COLOR : true)
  const width = options?.width ?? 80

  return render(tree, {
    ...options,
    colors,
    width,
    components: {
      ...defaultHandlers,
      ...options?.components,
    },
  })
}
