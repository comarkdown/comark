import type { ComarkTree } from '../types.ts'

/** Render a Comark AST as syntax-highlighted JSON into the given container */
export function renderAST(container: HTMLElement, tree: ComarkTree): void {
  const pre = document.createElement('pre')
  pre.innerHTML = syntaxHighlightJSON(tree)
  container.appendChild(pre)
}

/** Recursively count the total number of nodes in a Comark AST */
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

/** Regex-based fallback markdown highlighter used when Shiki is unavailable */
export function highlightMarkdown(source: string): string {
  const lines = source.split('\n')
  const result: string[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (/^```/.test(line)) {
      if (inCodeBlock) {
        // Closing fence
        result.push(`<span class="comark-md-code-fence">${escapeHTML(line)}</span>`)
        inCodeBlock = false
      } else {
        // Opening fence — highlight language name
        const match = line.match(/^(```)(\w*)(.*)/)
        if (match && match[2]) {
          result.push(
            `<span class="comark-md-code-fence">${escapeHTML(match[1])}</span>` +
            `<span class="comark-md-code-lang">${escapeHTML(match[2])}</span>` +
            (match[3] ? `<span class="comark-md-code-fence">${escapeHTML(match[3])}</span>` : '')
          )
        } else {
          result.push(`<span class="comark-md-code-fence">${escapeHTML(line)}</span>`)
        }
        inCodeBlock = true
      }
    } else if (inCodeBlock) {
      result.push(`<span class="comark-md-code-content">${escapeHTML(line)}</span>`)
    } else {
      result.push(highlightLine(line))
    }
  }

  return result.join('\n')
}

function highlightLine(line: string): string {
  const escaped = escapeHTML(line)

  // Frontmatter delimiters
  if (/^---\s*$/.test(line)) {
    return `<span class="comark-md-frontmatter">${escaped}</span>`
  }

  // Headings
  if (/^#{1,6}\s/.test(line)) {
    return `<span class="comark-md-heading">${escaped}</span>`
  }

  // Component syntax (::name or ::name{...})
  if (/^:{2,3}\w*/.test(line)) {
    return `<span class="comark-md-component">${escaped}</span>`
  }

  // Code block fences — handled by highlightMarkdown statefully

  // Blockquotes
  if (/^>\s?/.test(line)) {
    return `<span class="comark-md-blockquote">${highlightInline(escaped)}</span>`
  }

  // List items
  if (/^\s*[-*+]\s/.test(line) || /^\s*\d+\.\s/.test(line)) {
    const match = escaped.match(/^(\s*(?:[-*+]|\d+\.)\s)(.*)$/)
    if (match) {
      return `<span class="comark-md-list-marker">${match[1]}</span>${highlightInline(match[2])}`
    }
  }

  return highlightInline(escaped)
}

function highlightInline(text: string): string {
  return (
    text
      // Bold (**...**)
      .replace(/(\*\*|__)(.*?)\1/g, '<span class="comark-md-bold">$1$2$1</span>')
      // Italic (*...* or _..._) — avoid matching ** or __
      .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<span class="comark-md-italic">*$1*</span>')
      // Inline code (`...`)
      .replace(/(`)(.*?)(`)/g, '<span class="comark-md-code">$1$2$3</span>')
      // Links ([text](url))
      .replace(
        /(\[)(.*?)(\]\()(.*?)(\))/g,
        '<span class="comark-md-link">$1$2$3<span class="comark-md-url">$4</span>$5</span>'
      )
      // Component attributes ({key="value"})
      .replace(/(\{)(.*?)(\})/g, '<span class="comark-md-attrs">$1$2$3</span>')
  )
}

function escapeHTML(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
