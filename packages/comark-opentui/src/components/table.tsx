/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import type { ElementNode, Node } from 'comark'
import { textContent } from 'comark/utils'
import React, { createContext, useContext, useMemo } from 'react'
import { useMarkdownTheme } from '../theme.ts'
import { isElementNode, withNode } from '../utils.ts'
import { reflowInline } from './flow.tsx'

/** Cell padding, and the floor a column can shrink to. */
const CELL_GUTTER = 1
const MIN_COLUMN_WIDTH = 3

/**
 * Ceiling on a measured column so one long cell cannot push the table past a
 * sane terminal width. Cells above it wrap inside their column.
 */
const MAX_COLUMN_WIDTH = 40

const ColumnWidthsContext = createContext<number[]>([])
const CellIndexContext = createContext(0)

function rowsOf(node: ElementNode | undefined): ElementNode[] {
  if (!node) {
    return []
  }

  const rows: ElementNode[] = []

  const walk = (children: Node[]) => {
    for (const child of children) {
      if (!isElementNode(child)) {
        continue
      }

      if (child[0] === 'tr') {
        rows.push(child)
        continue
      }

      walk(child.slice(2) as Node[])
    }
  }

  walk(node.slice(2) as Node[])

  return rows
}

/**
 * Measure every column across every row.
 *
 * Column alignment cannot be done by a cell on its own — it needs the widest
 * cell in its column, which lives in sibling rows. The table is the only node
 * that sees them all, so it measures once from the source AST and passes the
 * result down; `td` / `th` just claim their slot.
 */
export function measureColumns(node: ElementNode | undefined): number[] {
  const widths: number[] = []

  for (const row of rowsOf(node)) {
    const cells = (row.slice(2) as Node[]).filter(isElementNode)

    cells.forEach((cell, index) => {
      const width = Math.min(textContent(cell).trim().length + CELL_GUTTER, MAX_COLUMN_WIDTH)

      widths[index] = Math.max(widths[index] ?? MIN_COLUMN_WIDTH, width)
    })
  }

  return widths
}

interface NodeProps {
  children?: React.ReactNode
  __node?: ElementNode
}

export const Table = withNode<NodeProps>(({ children, __node }) => {
  const widths = useMemo(() => measureColumns(__node), [__node])

  return (
    <ColumnWidthsContext.Provider value={widths}>
      <box flexDirection="column">{children}</box>
    </ColumnWidthsContext.Provider>
  )
})

/** Header group, with the rule that separates it from the body. */
export const TableHead: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const widths = useContext(ColumnWidthsContext)
  const theme = useMarkdownTheme()

  return (
    <box flexDirection="column">
      {children}
      <box flexDirection="row">
        {widths.map((width, index) => (
          <text
            key={index}
            fg={theme.tableBorder}
            width={width}
            flexShrink={1}
          >
            {'─'.repeat(Math.max(width - CELL_GUTTER, 1))}
          </text>
        ))}
      </box>
    </box>
  )
}

export const TableBody: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <box flexDirection="column">{children}</box>
}

/**
 * Row. Each cell is told its column index here — a cell cannot work out its own
 * position, and the index is what maps it to a measured width.
 */
export const TableRow: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  let column = 0

  const cells = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return null
    }

    return <CellIndexContext.Provider value={column++}>{child}</CellIndexContext.Provider>
  })

  return <box flexDirection="row">{cells}</box>
}

function Cell({ children, header }: { children?: React.ReactNode; header: boolean }) {
  const widths = useContext(ColumnWidthsContext)
  const index = useContext(CellIndexContext)

  return (
    <text
      width={widths[index] ?? MIN_COLUMN_WIDTH}
      flexShrink={1}
      attributes={header ? TextAttributes.BOLD : undefined}
    >
      {reflowInline(children)}
    </text>
  )
}

export const TableHeaderCell: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Cell header>{children}</Cell>
)

export const TableCell: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Cell header={false}>{children}</Cell>
)
