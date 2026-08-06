/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import type React from 'react'
import { useMarkdownTheme } from '../theme.ts'

interface ChildrenProps {
  children?: React.ReactNode
}

/**
 * Inline `code`. Mapped explicitly because OpenTUI's native `code` host is a
 * `CodeRenderable` — a block-level, syntax-highlighted panel. Leaving this
 * unmapped puts one of those inside a paragraph's text node.
 */
export const InlineCode: React.FC<ChildrenProps> = ({ children }) => {
  const theme = useMarkdownTheme()

  return (
    <span
      fg={theme.codeFg}
      bg={theme.codeBg}
    >
      {children}
    </span>
  )
}

/** `~~struck~~`. OpenTUI has no native host for it, unlike bold and italic. */
export const Strikethrough: React.FC<ChildrenProps> = ({ children }) => {
  return <span attributes={TextAttributes.STRIKETHROUGH}>{children}</span>
}
