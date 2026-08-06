/** @jsxImportSource @opentui/react */
import type { ElementNode } from 'comark'
import type React from 'react'
import { useMarkdownTheme } from '../theme.ts'
import { withNode } from '../utils.ts'

interface MathProps {
  children?: React.ReactNode
  __node?: ElementNode
}

/**
 * TeX from the math plugin, shown as its source.
 *
 * A terminal cannot typeset it, and the expression is what a reader can copy or
 * act on. Mapping it is not only cosmetic: the node carries no `$.block` meta,
 * so the generic fallback would treat inline math as block and put a box inside
 * a paragraph's text node. Inline versus block comes off the plugin's
 * `class="math inline"` / `"math block"`.
 */
export const Math = withNode<MathProps>(({ children, __node }) => {
  const theme = useMarkdownTheme()
  const attrs = __node?.[1]
  const source = typeof attrs?.content === 'string' ? attrs.content : children
  const isBlock = String(attrs?.class ?? '').includes('block')

  if (isBlock) {
    return (
      <box flexDirection="column">
        <text fg={theme.codeFg}>{source}</text>
      </box>
    )
  }

  return <span fg={theme.codeFg}>{source}</span>
})
