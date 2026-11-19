import type { State } from 'comark/render'
import type { ElementNode, Node } from 'comark'
import { comarkAttributes, userBlockAttrs } from '../attributes.ts'
import { component } from './component.ts'

type Alignment = 'left' | 'center' | 'right' | null

const TABLE_SECTIONS = new Set(['thead', 'tbody', 'tr'])

function getAlignment(attributes: Record<string, unknown>): Alignment {
  const style = attributes.style
  if (typeof style !== 'string') {
    return null
  }

  const normalized = style.toLowerCase().split(' ').join('').split('\t').join('')

  if (normalized.includes('text-align:left')) {
    return 'left'
  }
  if (normalized.includes('text-align:center')) {
    return 'center'
  }
  if (normalized.includes('text-align:right')) {
    return 'right'
  }

  return null
}

async function getCellContent(cell: Node, state: State): Promise<string> {
  if (typeof cell === 'string') {
    return escapePipes(cell)
  }

  const [, , ...children] = cell
  let content = ''
  for (const child of children) {
    if (typeof child === 'string') {
      content += child
    } else {
      content += await state.one(child, state, cell as unknown as ElementNode)
    }
  }

  // The parser trims U+00A0 from cell edges
  const trimmed = content.replace(/^[ \t\n]+|[ \t\n]+$/g, '')
  return escapePipes(trimmed.replace(/^\u00a0+|\u00a0+$/g, (nbsp) => '&nbsp;'.repeat(nbsp.length)))
}

function escapePipes(text: string): string {
  // GFM table cells cannot span lines.
  return text.split('\n').join(' ').split('|').join('\\|')
}

function getRows(element: Node): ElementNode[] {
  if (typeof element === 'string') {
    return []
  }

  const [tag, , ...children] = element

  if (tag === 'tr') {
    return [element]
  }

  if (tag === 'thead' || tag === 'tbody') {
    return children.filter((child) => typeof child !== 'string' && child[0] === 'tr') as ElementNode[]
  }

  return []
}

function getCells(row: ElementNode): ElementNode[] {
  const [, , ...children] = row
  return children.filter(
    (child) => typeof child !== 'string' && (child[0] === 'th' || child[0] === 'td')
  ) as ElementNode[]
}

export async function table(node: ElementNode, state: State, parent?: ElementNode) {
  const [, , ...children] = node

  // A parsed table always has rows; without them this is a `::table` component.
  if (!children.some((child) => Array.isArray(child) && TABLE_SECTIONS.has(child[0] as string))) {
    return component(node, state, parent)
  }

  let headerRows: ElementNode[] = []
  let bodyRows: ElementNode[] = []

  for (const child of children) {
    if (typeof child === 'string') continue

    const [tag] = child
    if (tag === 'thead') {
      headerRows = getRows(child)
    } else if (tag === 'tbody') {
      bodyRows = getRows(child)
    } else if (tag === 'tr') {
      const cells = getCells(child)
      if (cells.length > 0 && cells[0][0] === 'th') {
        headerRows.push(child)
      } else {
        bodyRows.push(child)
      }
    }
  }

  // GFM tables require a header row.
  if (headerRows.length === 0 && bodyRows.length > 0) {
    const firstRow = bodyRows[0]
    const cells = getCells(firstRow)
    const headerCells: ElementNode[] = cells.map((_, i) => ['th', {}, `Column ${i + 1}`] as ElementNode)
    headerRows = [['tr', {}, ...headerCells] as ElementNode]
  }

  if (headerRows.length === 0) {
    return ''
  }

  const headerRow = headerRows[0]
  const headerCells = getCells(headerRow)
  const headerContent: string[] = []
  for (const cell of headerCells) {
    headerContent.push(await getCellContent(cell, state))
  }

  const alignments = headerCells.map((cell) => {
    const [, attributes] = cell
    return getAlignment(attributes)
  })

  const columnWidths = headerContent.map((content) => Math.max(3, content.length))

  for (const row of bodyRows) {
    const cells = getCells(row)
    for (let i = 0; i < cells.length; i++) {
      if (i < columnWidths.length) {
        const content = await getCellContent(cells[i], state)
        columnWidths[i] = Math.max(columnWidths[i], content.length)
      }
    }
  }

  let result = '| '
  result += headerContent.map((content, i) => content.padEnd(columnWidths[i])).join(' | ')
  result += ' |\n'

  result += '| '
  result += columnWidths
    .map((width, i) => {
      const alignment = alignments[i]
      if (alignment === 'left') {
        return ':' + '-'.repeat(width - 1)
      } else if (alignment === 'center') {
        return ':' + '-'.repeat(width - 2) + ':'
      } else if (alignment === 'right') {
        return '-'.repeat(width - 1) + ':'
      }
      return '-'.repeat(width)
    })
    .join(' | ')
  result += ' |\n'

  for (const row of bodyRows) {
    const cells = getCells(row)
    const cellContents: string[] = []
    for (let i = 0; i < cells.length; i++) {
      const content = await getCellContent(cells[i], state)
      cellContents.push(content.padEnd(columnWidths[i] || 0))
    }

    while (cellContents.length < columnWidths.length) {
      cellContents.push(''.padEnd(columnWidths[cellContents.length]))
    }

    result += '| ' + cellContents.join(' | ') + ' |\n'
  }

  // Tables with user attrs round-trip via `::table{attrs}`: GFM table syntax
  // has no slot for table-level attrs.
  const attrs = comarkAttributes(userBlockAttrs('table', node[1] as Record<string, unknown>))
  if (attrs) {
    return `::table${attrs}\n${result.trimEnd()}\n::\n\n`
  }

  return result + '\n'
}

// Table sections and cells are serialized by the parent `table` handler.
export function thead(_node: ElementNode, _state: State) {
  return ''
}

export function tbody(_node: ElementNode, _state: State) {
  return ''
}

export function tr(_node: ElementNode, _state: State) {
  return ''
}

export function th(_node: ElementNode, _state: State) {
  return ''
}

export function td(_node: ElementNode, _state: State) {
  return ''
}
