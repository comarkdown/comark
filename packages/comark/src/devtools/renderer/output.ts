type ComarkTree = {
  nodes: unknown[]
  frontmatter: Record<string, unknown>
  meta: Record<string, unknown>
}

export function renderAST(container: HTMLElement, tree: ComarkTree): void {
  const pre = document.createElement('pre')
  pre.innerHTML = syntaxHighlightJSON(tree)
  container.appendChild(pre)
}

export function renderRoundtrip(container: HTMLElement, roundtrip: string, original: string): void {
  const pre = document.createElement('pre')
  pre.textContent = roundtrip
  container.appendChild(pre)

  const isMatch = original.trim() === roundtrip.trim()
  const indicator = document.createElement('div')
  indicator.style.cssText = `
    margin-top: 12px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    background: ${isMatch ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'};
    color: ${isMatch ? '#10b981' : '#f59e0b'};
  `
  indicator.textContent = isMatch
    ? '✓ Roundtrip match — parse → render produces identical output'
    : '⚠ Roundtrip mismatch — output differs from input (whitespace or formatting changes)'
  container.appendChild(indicator)
}

export function renderInfo(container: HTMLElement, tree: ComarkTree, inputLength: number): void {
  const table = document.createElement('table')
  table.className = 'comark-info-table'

  const rows = [
    ['Nodes', String(tree.nodes.length)],
    ['Total nodes (deep)', String(countNodes(tree.nodes))],
    ['Input length', `${inputLength} chars`],
    ['Frontmatter keys', Object.keys(tree.frontmatter).join(', ') || '(none)'],
    ['Meta keys', Object.keys(tree.meta).join(', ') || '(none)'],
  ]

  if (Object.keys(tree.frontmatter).length > 0) {
    rows.push(['Frontmatter', JSON.stringify(tree.frontmatter, null, 2)])
  }

  for (const [key, value] of rows) {
    const tr = document.createElement('tr')
    const td1 = document.createElement('td')
    td1.textContent = key
    const td2 = document.createElement('td')
    td2.textContent = value
    if (key === 'Frontmatter') {
      const pre = document.createElement('pre')
      pre.style.margin = '0'
      pre.textContent = value
      td2.textContent = ''
      td2.appendChild(pre)
    }
    tr.appendChild(td1)
    tr.appendChild(td2)
    table.appendChild(tr)
  }

  container.appendChild(table)
}

export function countNodes(nodes: unknown[]): number {
  let count = 0
  for (const node of nodes) {
    count++
    if (Array.isArray(node) && node.length > 2) {
      count += countNodes(node.slice(2) as unknown[])
    }
  }
  return count
}

function syntaxHighlightJSON(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)

  if (obj === null || obj === undefined) {
    return `<span class="comark-tree-null">null</span>`
  }
  if (typeof obj === 'boolean') {
    return `<span class="comark-tree-bool">${obj}</span>`
  }
  if (typeof obj === 'number') {
    return `<span class="comark-tree-number">${obj}</span>`
  }
  if (typeof obj === 'string') {
    return `<span class="comark-tree-string">${escapeHTML(JSON.stringify(obj))}</span>`
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    const items = obj.map((item) => `${pad}  ${syntaxHighlightJSON(item, indent + 1)}`)
    return `[\n${items.join(',\n')}\n${pad}]`
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const items = entries.map(
      ([key, val]) =>
        `${pad}  <span class="comark-tree-key">${escapeHTML(JSON.stringify(key))}</span>: ${syntaxHighlightJSON(val, indent + 1)}`
    )
    return `{\n${items.join(',\n')}\n${pad}}`
  }
  return String(obj)
}

function escapeHTML(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
