import type { State } from '../types'
import type { ComarkElement, ComarkNode } from '../../../ast/types'

type Alignment = 'left' | 'center' | 'right' | null

// Helper function to extract alignment from style attribute
function getAlignment(attributes: Record<string, unknown>): Alignment {
  const style = attributes.style
  if (typeof style !== 'string') {
    return null
  }

  // Parse text-align from style attribute - normalize and check
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

// Helper function to extract text content from a cell
function getCellContent(cell: ComarkNode, state: State): string {
  if (typeof cell === 'string') {
    return escapePipes(cell)
  }

  const [, , ...children] = cell
  const content = children.map((child) => {
    if (typeof child === 'string') {
      return child
    }
    return state.one(child, state, cell)
  }).join('').trim()

  return escapePipes(content)
}

// Helper function to escape pipe characters and handle newlines
function escapePipes(text: string): string {
  // Replace newlines with spaces (tables don't support multi-line cells)
  // Then escape pipe characters
  return text.split('\n').join(' ').split('|').join('\\|')
}

// Helper function to get all rows from thead/tbody
function getRows(element: ComarkNode): ComarkElement[] {
  if (typeof element === 'string') {
    return []
  }

  const [tag, , ...children] = element

  // If it's a tr, return it directly
  if (tag === 'tr') {
    return [element]
  }

  // If it's thead/tbody, extract tr elements
  if (tag === 'thead' || tag === 'tbody') {
    return children.filter(child =>
      typeof child !== 'string' && child[0] === 'tr',
    ) as ComarkElement[]
  }

  return []
}

// Helper function to get cells from a row
function getCells(row: ComarkElement): ComarkElement[] {
  const [, , ...children] = row
  return children.filter(child =>
    typeof child !== 'string' && (child[0] === 'th' || child[0] === 'td'),
  ) as ComarkElement[]
}

export function table(node: ComarkElement, state: State) {
  const [, , ...children] = node

  // Extract thead and tbody
  let headerRows: ComarkElement[] = []
  let bodyRows: ComarkElement[] = []

  for (const child of children) {
    if (typeof child === 'string') continue

    const [tag] = child
    if (tag === 'thead') {
      headerRows = getRows(child)
    }
    else if (tag === 'tbody') {
      bodyRows = getRows(child)
    }
    else if (tag === 'tr') {
      // Direct tr children (no thead/tbody wrapper)
      const cells = getCells(child)
      if (cells.length > 0 && cells[0][0] === 'th') {
        headerRows.push(child)
      }
      else {
        bodyRows.push(child)
      }
    }
  }

  // If no header rows, create a default header based on the first body row
  if (headerRows.length === 0 && bodyRows.length > 0) {
    const firstRow = bodyRows[0]
    const cells = getCells(firstRow)
    const headerCells: ComarkElement[] = cells.map((_, i) =>
      ['th', {}, `Column ${i + 1}`] as ComarkElement,
    )
    headerRows = [['tr', {}, ...headerCells] as ComarkElement]
  }

  if (headerRows.length === 0) {
    return ''
  }

  // Process header row (use the first header row)
  const headerRow = headerRows[0]
  const headerCells = getCells(headerRow)
  const headerContent = headerCells.map(cell => getCellContent(cell, state))

  // Extract alignment from header cells
  const alignments = headerCells.map((cell) => {
    const [, attributes] = cell
    return getAlignment(attributes)
  })

  // Calculate column widths (minimum 3 characters per column)
  const columnWidths = headerContent.map(content => Math.max(3, content.length))

  // Update column widths based on body content
  for (const row of bodyRows) {
    const cells = getCells(row)
    cells.forEach((cell, i) => {
      if (i < columnWidths.length) {
        const content = getCellContent(cell, state)
        columnWidths[i] = Math.max(columnWidths[i], content.length)
      }
    })
  }

  // Build the markdown table
  let result = '| '
  result += headerContent.map((content, i) =>
    content.padEnd(columnWidths[i]),
  ).join(' | ')
  result += ' |\n'

  // Add separator row with alignment
  result += '| '
  result += columnWidths.map((width, i) => {
    const alignment = alignments[i]
    if (alignment === 'left') {
      return ':' + '-'.repeat(width - 1)
    }
    else if (alignment === 'center') {
      return ':' + '-'.repeat(width - 2) + ':'
    }
    else if (alignment === 'right') {
      return '-'.repeat(width - 1) + ':'
    }
    return '-'.repeat(width)
  }).join(' | ')
  result += ' |\n'

  // Add body rows
  for (const row of bodyRows) {
    const cells = getCells(row)
    const cellContents = cells.map((cell, i) => {
      const content = getCellContent(cell, state)
      return content.padEnd(columnWidths[i] || 0)
    })

    // Fill missing columns with empty cells
    while (cellContents.length < columnWidths.length) {
      cellContents.push(''.padEnd(columnWidths[cellContents.length]))
    }

    result += '| ' + cellContents.join(' | ') + ' |\n'
  }

  // result already ends with \n, so we only need to add one more \n
  return result + '\n'
}

export function thead(_node: ComarkElement, _state: State) {
  // thead is handled by the table handler
  return ''
}

export function tbody(_node: ComarkElement, _state: State) {
  // tbody is handled by the table handler
  return ''
}

export function tr(_node: ComarkElement, _state: State) {
  // tr is handled by the table handler
  return ''
}

export function th(_node: ComarkElement, _state: State) {
  // th is handled by the table handler
  return ''
}

export function td(_node: ComarkElement, _state: State) {
  // td is handled by the table handler
  return ''
}
