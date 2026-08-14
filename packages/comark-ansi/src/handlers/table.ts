import type { NodeHandler, State } from 'comark/render'
import type { ElementNode, Node } from 'comark'
import { DIM, BOLD, RESET, padEndVisible, visibleLength } from '../utils/escape.ts'

async function getCellText(cell: Node, state: State): Promise<string> {
  if (typeof cell === 'string') return cell
  const [, , ...children] = cell
  let result = ''
  for (const child of children) {
    result += typeof child === 'string' ? child : await state.one(child, state, cell as ElementNode)
  }
  return result.trim()
}

function getRows(node: Node): ElementNode[] {
  if (typeof node === 'string') return []
  const [tag, , ...children] = node
  if (tag === 'tr') return [node as ElementNode]
  if (tag === 'thead' || tag === 'tbody') {
    return children.filter((c) => typeof c !== 'string' && c[0] === 'tr') as ElementNode[]
  }
  return []
}

function getCells(row: ElementNode): ElementNode[] {
  return (row.slice(2) as Node[]).filter(
    (c) => typeof c !== 'string' && (c[0] === 'th' || c[0] === 'td')
  ) as ElementNode[]
}

export const table: NodeHandler = async (node, state) => {
  const [, , ...children] = node

  let headerRows: ElementNode[] = []
  let bodyRows: ElementNode[] = []

  for (const child of children) {
    if (typeof child === 'string') continue
    if (child[0] === 'thead') headerRows = getRows(child)
    else if (child[0] === 'tbody') bodyRows = getRows(child)
    else if (child[0] === 'tr') {
      const cells = getCells(child)
      if (cells[0]?.[0] === 'th') headerRows.push(child)
      else bodyRows.push(child)
    }
  }

  if (headerRows.length === 0) return ''

  const headerCells = getCells(headerRows[0])
  const headers: string[] = []
  for (const c of headerCells) {
    headers.push(await getCellText(c, state))
  }
  // Widths are visible terminal columns (ANSI escapes do not count).
  const colWidths = headers.map((h) => Math.max(3, visibleLength(h)))

  for (const row of bodyRows) {
    const cells = getCells(row)
    for (let i = 0; i < cells.length; i++) {
      if (i < colWidths.length) {
        const text = await getCellText(cells[i], state)
        colWidths[i] = Math.max(colWidths[i], visibleLength(text))
      }
    }
  }

  const { colors } = state.context
  const sep = (left: string, mid: string, right: string, fill: string) =>
    left + colWidths.map((w) => fill.repeat(w + 2)).join(mid) + right

  const topBorder = sep('┌', '┬', '┐', '─')
  const midBorder = sep('├', '┼', '┤', '─')
  const botBorder = sep('└', '┴', '┘', '─')

  const fmtRow = (cells: string[], bold = false) => {
    const cols = cells.map((c, i) => ' ' + padEndVisible(c, colWidths[i]) + ' ')
    if (colors && bold) return '│' + cols.map((c) => BOLD + c + RESET).join('│') + '│'
    if (colors) return DIM + '│' + RESET + cols.join(DIM + '│' + RESET) + DIM + '│' + RESET
    return '│' + cols.join('│') + '│'
  }

  const lines: string[] = []
  lines.push(colors ? DIM + topBorder + RESET : topBorder)
  lines.push(fmtRow(headers, true))

  for (const row of bodyRows) {
    const cells = getCells(row)
    const contents: string[] = []
    for (let i = 0; i < colWidths.length; i++) {
      contents.push(await getCellText(cells[i] ?? (['td', {}] as ElementNode), state))
    }
    lines.push(colors ? DIM + midBorder + RESET : midBorder)
    lines.push(fmtRow(contents))
  }

  lines.push(colors ? DIM + botBorder + RESET : botBorder)
  return lines.join('\n') + '\n\n'
}

// These are handled by table
export const thead: NodeHandler = () => ''
export const tbody: NodeHandler = () => ''
export const tr: NodeHandler = () => ''
export const th: NodeHandler = () => ''
export const td: NodeHandler = () => ''
