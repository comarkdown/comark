import type { ElementNode, State } from 'comark'
import type { ThemeNames } from 'comark/plugins/mermaid'
import { renderMermaidASCII, THEMES } from 'beautiful-mermaid'

export * from 'comark/plugins/mermaid'
export { default } from 'comark/plugins/mermaid'

/**
 * ANSI component render function for mermaid nodes.
 * Renders diagrams as terminal-friendly ASCII using `beautiful-mermaid`.
 *
 * @example
 * ```typescript
 * import mermaid, { Mermaid } from '@comark/ansi/plugins/mermaid'
 * import { createAnsiRenderer } from '@comark/ansi'
 *
 * const renderAnsi = createAnsiRenderer({
 *   plugins: [mermaid()],
 *   components: { Mermaid },
 * })
 * ```
 */
export const Mermaid = ([, attrs]: ElementNode, state: State): string => {
  const content = String(attrs.content ?? '')
  const themeName = attrs.theme as ThemeNames | undefined
  const theme = (themeName && THEMES[themeName]) ?? THEMES['zinc-light']

  try {
    const svg = renderMermaidASCII(content, { theme })
    return svg + state.context.blockSeparator
  } catch {
    return content + state.context.blockSeparator
  }
}
