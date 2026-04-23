/**
 * Parse cell widths from a table row (respects escaped pipes \|)
 */
function parseCellWidths(row: string): number[] {
  const widths: number[] = []
  let cellContent = ''
  let inCell = false

  for (let i = 0; i < row.length; i++) {
    const ch = row[i]
    const isEscapedPipe = ch === '|' && i > 0 && row[i - 1] === '\\'

    if (ch === '|' && !isEscapedPipe) {
      if (inCell && cellContent) {
        widths.push(cellContent.length)
        cellContent = ''
      }
      inCell = true
    } else if (inCell) {
      cellContent += ch
    }
  }

  // Capture last cell if no trailing pipe
  if (inCell && cellContent) {
    widths.push(cellContent.length)
  }

  return widths
}

/**
 * Parse cell contents from a table row (respects escaped pipes \|)
 */
function parseCells(row: string): string[] {
  const cells: string[] = []
  let cell = ''
  let inCell = false

  for (let i = 0; i < row.length; i++) {
    const ch = row[i]
    const isEscapedPipe = ch === '|' && i > 0 && row[i - 1] === '\\'

    if (ch === '|' && !isEscapedPipe) {
      if (inCell) {
        cells.push(cell.trim())
        cell = ''
      }
      inCell = true
    } else if (inCell) {
      cell += ch
    }
  }

  // Capture last cell if any
  if (cell.trim()) {
    cells.push(cell.trim())
  }

  return cells
}

/**
 * Closes unclosed markdown tables
 */
export function closeTables(markdown: string): string {
  const lines = markdown.split('\n')

  // Group consecutive table rows (lines starting with |) into blocks
  const tableBlocks: Array<{ start: number; end: number }> = []
  let blockStart = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|')) {
      if (blockStart === -1) blockStart = i
    } else if (blockStart !== -1) {
      tableBlocks.push({ start: blockStart, end: i - 1 })
      blockStart = -1
    }
  }

  if (blockStart !== -1) {
    tableBlocks.push({ start: blockStart, end: lines.length - 1 })
  }
  if (tableBlocks.length === 0) return markdown

  // Process last table
  const { start, end } = tableBlocks[tableBlocks.length - 1]
  const headerLine = lines[start].trim()

  // Ensure header has trailing pipe
  if (!headerLine.endsWith('|')) {
    lines[start] += ' |'
  }

  // Count columns from header
  const columnCount = parseCellWidths(lines[start].trim()).length
  const generateSeparator = () => '| ' + Array(columnCount).fill('---').join(' | ') + ' |'

  // Check if separator exists (including incomplete ones with just :)
  const secondLine = end - start >= 1 ? lines[start + 1].trim() : ''
  const hasSeparator = secondLine.startsWith('|') && (secondLine.includes('-') || secondLine.includes(':'))

  // Handle last line
  const lastLine = lines[end].trim()
  const isSeparator = lastLine.startsWith('|') && (lastLine.includes('-') || lastLine.includes(':'))

  if (isSeparator) {
    // Parse and complete separator cells
    const sepCells = parseCells(lastLine)

    // Complete each cell: ensure minimum dash count
    const completedCells = sepCells.map((cell) => {
      const hasLeftAlign = cell.startsWith(':')
      const hasRightAlign = cell.endsWith(':') && cell.length > 1

      // Strip alignment markers to count dashes
      let dashes = cell.replace(/^:/, '').replace(/:$/, '')

      // Ensure at least 1 dash (alignment markers don't need extra length)
      if (hasLeftAlign && hasRightAlign) {
        // Center align :-:
        if (dashes.length < 1) dashes = '-'
        return ':' + dashes + ':'
      } else if (hasLeftAlign) {
        // Left align :-
        if (dashes.length < 1) dashes = '-'
        return ':' + dashes
      } else if (hasRightAlign) {
        // Right align -:
        if (dashes.length < 1) dashes = '-'
        return dashes + ':'
      } else {
        // No align ---
        while (dashes.length < 3) dashes += '-'
        return dashes
      }
    })

    // Add missing columns
    while (completedCells.length < columnCount) {
      completedCells.push('---')
    }

    lines[end] = '| ' + completedCells.join(' | ') + ' |'
  } else if (lastLine.startsWith('|') && !lastLine.endsWith('|')) {
    // Complete data row - find reference widths and pad
    let refRow = lines[start].trim()
    for (let i = start + (hasSeparator ? 2 : 1); i < end; i++) {
      const row = lines[i].trim()
      if (row.startsWith('|') && row.endsWith('|') && !row.includes('-')) {
        refRow = row
        break
      }
    }

    const refWidths = parseCellWidths(refRow)
    const cells = parseCells(lastLine)

    // Rebuild with padding
    lines[end] =
      '| ' +
      cells
        .map((cell, i) => {
          const targetWidth = refWidths[i] || cell.length + 2
          const padding = ' '.repeat(Math.max(0, targetWidth - cell.length - 2))
          return cell + padding
        })
        .join(' | ') +
      ' |'
  }

  // Add separator if missing
  if (!hasSeparator) {
    lines.splice(start + 1, 0, generateSeparator())
  }

  return lines.join('\n')
}
