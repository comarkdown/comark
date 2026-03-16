import type { ComarkElement } from 'comark/ast'
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
 * import mermaid, { mermaid as mermaidRenderer } from '@comark/html/plugins/mermaid'
 * import { createRender } from '@comark/html'
 *
 * const render = createRender({
 *   parse: { plugins: [mermaid()] },
 *   render: { components: { mermaid: mermaidRenderer } },
 * })
 * ```
 */
export const mermaid = ([, attrs]: ComarkElement): string => {
  const content = String(attrs.content ?? '')
  const themeName = attrs.theme as ThemeNames | undefined
  const theme = (themeName && THEMES[themeName]) ?? THEMES['zinc-light']

  try {
    const svg = renderMermaidSVG(content, theme)
    return `<div class="mermaid">${svg}</div>`
  }
  catch {
    return `<pre class="mermaid">${content}</pre>`
  }
}
