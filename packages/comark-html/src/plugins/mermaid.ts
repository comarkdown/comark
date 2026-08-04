import type { ElementNode } from 'comark'
import type { ThemeNames } from 'comark/plugins/mermaid'
import { renderMermaidSVG, THEMES } from 'beautiful-mermaid'

export * from 'comark/plugins/mermaid'
export { default } from 'comark/plugins/mermaid'

/**
 * HTML component render function for mermaid nodes.
 * Renders diagrams to inline SVG using `beautiful-mermaid`.
 *
 * @example
 * ```typescript
 * import mermaid, { Mermaid } from '@comark/html/plugins/mermaid'
 * import { createHtmlRenderer } from '@comark/html'
 *
 * const renderHtml = createHtmlRenderer({
 *   plugins: [mermaid()],
 *   components: { Mermaid },
 * })
 * ```
 */
export const Mermaid = ([, attrs]: ElementNode): string => {
  const content = String(attrs.content ?? '')
  const themeName = attrs.theme as ThemeNames | undefined
  const theme = (themeName && THEMES[themeName]) ?? THEMES['zinc-light']

  try {
    const svg = renderMermaidSVG(content, theme)
    return `<div class="mermaid">${svg}</div>`
  } catch {
    return `<pre class="mermaid">${content}</pre>`
  }
}
