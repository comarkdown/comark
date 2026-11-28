import type { Node } from 'comark'
import type { Token } from 'markdown-exit/core'

// Upper bound for expanded highlight ranges in a fence info string.
const MAX_HIGHLIGHT_LINES = 1_000

interface CodeBlockInfo extends Record<string, unknown> {
  language?: string
  filename?: string
  highlights?: number[]
  meta?: string
}
/**
 * Parse codeblock info string to extract language, highlights, filename, and meta
 * Example: "javascript {1-3} [filename.ts] meta=value"
 * Example: "typescript[filename]{1,3-5}meta"
 */
export function parseCodeblockInfo(info: string): CodeBlockInfo {
  if (!info) {
    return {}
  }

  const result: CodeBlockInfo = {}

  let remaining = info.trim()

  // Extract language (stops at [ or { or whitespace).
  // Quotes and angle brackets are excluded: the language lands in the
  // `language` attr and `language-*` class of the rendered HTML.
  const languageMatch = remaining.match(/^([^\s[{}"'<>`]+)/)
  if (languageMatch) {
    result.language = languageMatch[1]
    remaining = remaining.slice(languageMatch[1].length).trim()
  }

  // `{highlights}` and `[filename]` may appear in either order.
  while (remaining && (remaining.startsWith('{') || remaining.startsWith('['))) {
    if (remaining.startsWith('{')) {
      const highlightsMatch = remaining.match(/^\{([^}]+)\}/)
      if (highlightsMatch) {
        const highlightsStr = highlightsMatch[1]
        remaining = remaining.slice(highlightsMatch[0].length).trim()

        // Bound range expansion so a fence like ```js {1-999999999} cannot
        // materialize a billion-entry array.
        const highlights: number[] = []
        const parts = highlightsStr.split(',')
        for (const part of parts) {
          const trimmed = part.trim()
          if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map((s) => Number.parseInt(s.trim(), 10))
            if (!Number.isNaN(start) && !Number.isNaN(end) && end - start <= MAX_HIGHLIGHT_LINES) {
              for (let i = start; i <= end && highlights.length < MAX_HIGHLIGHT_LINES; i++) {
                highlights.push(i)
              }
            }
          } else {
            const num = Number.parseInt(trimmed, 10)
            if (!Number.isNaN(num) && highlights.length < MAX_HIGHLIGHT_LINES) {
              highlights.push(num)
            }
          }
        }
        if (highlights.length > 0) {
          result.highlights = highlights
        } else if (!result.language && !/[\s"'<>`]/.test(highlightsMatch[1])) {
          result.language = highlightsMatch[0]
        }
      } else {
        break
      }
    } else if (remaining.startsWith('[')) {
      let depth = 0
      let i = 0
      for (; i < remaining.length; i++) {
        if (remaining[i] === '[') {
          depth++
        } else if (remaining[i] === ']') {
          depth--
          if (depth === 0) {
            const filename = remaining.slice(1, i)
            // Unescape backslashes: @[...slug\\\\].ts -> @[...slug].ts
            result.filename = filename.replace(/\\\\/g, '')
            remaining = remaining.slice(i + 1).trim()
            break
          }
        }
      }
      if (depth !== 0) break
    }
  }

  if (remaining) {
    result.meta = remaining
  }

  return result
}

/**
 * Extract and process attributes from a token's attrs array
 */
export function processAttributes(
  attrsArray: any[] | null | undefined,
  options: {
    handleBoolean?: boolean
    handleJSON?: boolean
    filterEmpty?: boolean
  } = {}
): Record<string, unknown> {
  const { handleJSON = true, filterEmpty = false } = options
  const attrs: Record<string, unknown> = {}

  if (!attrsArray || !Array.isArray(attrsArray)) {
    return attrs
  }

  for (const attr of attrsArray) {
    if (Array.isArray(attr) && attr.length >= 2) {
      const [key] = attr
      let value = attr[1]

      if (filterEmpty && (value === '' || value === null || value === undefined)) {
        continue
      }

      if (handleJSON && typeof value === 'string') {
        if (value.startsWith('{') && value.endsWith('}')) {
          try {
            value = JSON.parse(value)
          } catch {
            // non-JSON literal
          }
        } else if (value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value)
          } catch {
            // non-JSON literal
          }
        }
      }

      if (key === 'class' && typeof attrs[key] === 'string') {
        attrs[key] = `${attrs[key]} ${value}`
      } else {
        attrs[key] = value
      }
    }
  }

  return attrs
}
/**
 * Extract Comark attributes from mdc_inline_props token
 */
export function extractAttributes(
  tokens: Token[],
  startIndex: number,
  skipEmptyText: boolean = true
): { attrs: Record<string, unknown>; nextIndex: number } {
  let propsIndex = startIndex

  if (skipEmptyText) {
    while (propsIndex < tokens.length && tokens[propsIndex].type === 'text' && !tokens[propsIndex].content?.trim()) {
      propsIndex++
    }
  }

  if (propsIndex < tokens.length && tokens[propsIndex].type === 'mdc_inline_props') {
    const propsToken = tokens[propsIndex]
    const attrs = processAttributes(propsToken.attrs)
    return { attrs, nextIndex: propsIndex + 1 }
  }

  return { attrs: {}, nextIndex: startIndex }
}

/**
 * Merge adjacent string nodes in an array of nodes
 */
export function mergeAdjacentTextNodes(nodes: Node[]): Node[] {
  const merged: Node[] = []

  for (const node of nodes) {
    const lastNode = merged[merged.length - 1]

    if (typeof node === 'string' && typeof lastNode === 'string') {
      merged[merged.length - 1] = lastNode + node
    } else {
      merged.push(node)
    }
  }

  return merged
}
