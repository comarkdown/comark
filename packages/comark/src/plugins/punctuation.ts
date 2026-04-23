import type { ComarkNode } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'

export interface PunctuationOptions {
  /**
   * Convert straight quotes to smart (curly) quotes
   * @default true
   */
  quotes?: boolean | string | [string, string, string, string]

  /**
   * Convert -- to en-dash and --- to em-dash
   * @default true
   */
  dashes?: boolean

  /**
   * Convert ... to ellipsis character and normalize trailing dots after ? and !
   * @default true
   */
  ellipsis?: boolean

  /**
   * Convert (c), (r), (tm), +- to ©, ®, ™, ±
   * @default true
   */
  symbols?: boolean

  /**
   * Normalize repeated punctuation: ???? → ???, !!!! → !!!, ,, → ,
   * @default true
   */
  normalize?: boolean
}

const DEFAULT_QUOTES = '\u201C\u201D\u2018\u2019' // ""''

/** Tags whose text content should not be transformed */
const SKIP_TAGS = new Set(['code', 'pre', 'math', 'script', 'style', 'kbd'])

function isWhitespaceOrOpener(ch: string): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '(' || ch === '[' || ch === '{'
}

function isLetter(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
}

/**
 * Single-pass O(n) text transformation — replaces punctuation patterns
 * (ellipsis, dashes, symbols, smart quotes, normalization) in one scan with no regex.
 * Uses slice-based string building to minimize allocations.
 */
function applyPunctuation(
  text: string,
  enableQuotes: boolean,
  dashes: boolean,
  ellipsis: boolean,
  symbols: boolean,
  normalize: boolean,
  openDouble: string,
  closeDouble: string,
  openSingle: string,
  closeSingle: string
): string {
  const len = text.length
  let result = ''
  let last = 0

  for (let i = 0; i < len; i++) {
    const ch = text[i]

    // Ellipsis: two or more dots → … with special handling for ?... and !...
    if (ellipsis && ch === '.') {
      if (i + 1 < len && text[i + 1] === '.') {
        // Count consecutive dots
        let end = i + 2
        while (end < len && text[end] === '.') end++

        // Check if preceded by ? or ! → collapse to ?.. or !..
        const prev = i > 0 ? text[i - 1] : ''
        if (prev === '?' || prev === '!') {
          result += text.slice(last, i) + '..'
        } else {
          result += text.slice(last, i) + '\u2026'
        }
        i = end - 1
        last = i + 1
        continue
      }
    }

    // Dashes: --- (em-dash) or -- (en-dash)
    if (dashes && ch === '-' && i + 1 < len && text[i + 1] === '-') {
      if (i + 2 < len && text[i + 2] === '-') {
        result += text.slice(last, i) + '\u2014'
        i += 2
      } else {
        result += text.slice(last, i) + '\u2013'
        i += 1
      }
      last = i + 1
      continue
    }

    // Symbols: (c), (C), (r), (R), (tm), (TM), +-
    if (symbols && ch === '(') {
      const remaining = len - i
      if (remaining >= 3 && text[i + 2] === ')') {
        const inner = text[i + 1]
        if (inner === 'c' || inner === 'C') {
          result += text.slice(last, i) + '\u00A9'
          i += 2
          last = i + 1
          continue
        }
        if (inner === 'r' || inner === 'R') {
          result += text.slice(last, i) + '\u00AE'
          i += 2
          last = i + 1
          continue
        }
      }
      if (remaining >= 4 && text[i + 3] === ')') {
        const c1 = text[i + 1]
        const c2 = text[i + 2]
        if ((c1 === 't' || c1 === 'T') && (c2 === 'm' || c2 === 'M')) {
          result += text.slice(last, i) + '\u2122'
          i += 3
          last = i + 1
          continue
        }
      }
    }
    if (symbols && ch === '+' && i + 1 < len && text[i + 1] === '-') {
      result += text.slice(last, i) + '\u00B1'
      i += 1
      last = i + 1
      continue
    }

    // Normalize repeated punctuation: ???? → ???, !!!! → !!!, ,, → ,
    if (normalize) {
      if (ch === '?' || ch === '!') {
        let end = i + 1
        while (end < len && text[end] === ch) end++
        const count = end - i
        if (count >= 4) {
          result += text.slice(last, i) + ch + ch + ch
          i = end - 1
          last = i + 1
          continue
        }
      }
      if (ch === ',' && i + 1 < len && text[i + 1] === ',') {
        // Collapse ,, (or more) to ,
        let end = i + 2
        while (end < len && text[end] === ',') end++
        result += text.slice(last, i) + ','
        i = end - 1
        last = i + 1
        continue
      }
    }

    // Smart quotes
    if (enableQuotes) {
      if (ch === '"') {
        const prev = i > 0 ? text[i - 1] : ' '
        result += text.slice(last, i) + (isWhitespaceOrOpener(prev) || i === 0 ? openDouble : closeDouble)
        last = i + 1
        continue
      }
      if (ch === "'") {
        const prev = i > 0 ? text[i - 1] : ' '
        const next = i + 1 < len ? text[i + 1] : ''
        result += text.slice(last, i)
        // Apostrophe in contractions: letter before AND letter after
        if (isLetter(prev) && isLetter(next)) {
          result += closeSingle
        } else {
          result += isWhitespaceOrOpener(prev) || i === 0 ? openSingle : closeSingle
        }
        last = i + 1
        continue
      }
    }
  }

  // Fast path: no substitutions were made
  if (last === 0) return text

  return result + text.slice(last)
}

/**
 * Punctuation plugin for comark
 *
 * Transforms common punctuation patterns into their typographically correct Unicode characters:
 * - Smart (curly) quotes: "text" → \u201Ctext\u201D, 'text' → \u2018text\u2019
 * - Dashes: -- → \u2013 (en-dash), --- → \u2014 (em-dash)
 * - Ellipsis: ... → \u2026, ?.... → ?.., !.... → !..
 * - Symbols: (c) → \u00A9, (r) → \u00AE, (tm) → \u2122, +- → \u00B1
 * - Normalize: ???? → ???, !!!! → !!!, ,, → ,
 *
 * Does not transform text inside code, pre, math, kbd, script, or style elements.
 *
 * Supports locale-aware quote characters via the `quotes` option:
 * - String of 4 characters: `'«»„"'` (open double, close double, open single, close single)
 * - Array of 4 strings: `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (with nbsp)
 *
 * @param options Punctuation configuration
 *
 * @example
 * ```ts
 * import { parse } from 'comark'
 * import punctuation from 'comark/plugins/punctuation'
 *
 * const result = await parse('"Hello" -- world...', {
 *   plugins: [punctuation()]
 * })
 *
 * // Locale-aware quotes (Russian)
 * const result2 = await parse('"Hello"', {
 *   plugins: [punctuation({ quotes: '«»„"' })]
 * })
 *
 * // French quotes with non-breaking spaces
 * const result3 = await parse('"Hello"', {
 *   plugins: [punctuation({ quotes: ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] })]
 * })
 * ```
 */
export default defineComarkPlugin((options: PunctuationOptions = {}) => {
  const { quotes = true, dashes = true, ellipsis = true, symbols = true, normalize = true } = options

  // Resolve quote characters
  let enableQuotes: boolean
  let openDouble: string
  let closeDouble: string
  let openSingle: string
  let closeSingle: string

  if (quotes === false) {
    enableQuotes = false
    openDouble = closeDouble = openSingle = closeSingle = ''
  } else if (Array.isArray(quotes)) {
    enableQuotes = true
    openDouble = quotes[0]
    closeDouble = quotes[1]
    openSingle = quotes[2]
    closeSingle = quotes[3]
  } else if (typeof quotes === 'string') {
    enableQuotes = true
    openDouble = quotes[0]
    closeDouble = quotes[1]
    openSingle = quotes[2]
    closeSingle = quotes[3]
  } else {
    enableQuotes = true
    openDouble = DEFAULT_QUOTES[0]
    closeDouble = DEFAULT_QUOTES[1]
    openSingle = DEFAULT_QUOTES[2]
    closeSingle = DEFAULT_QUOTES[3]
  }

  return {
    name: 'punctuation',
    post(state) {
      function walkNodes(nodes: ComarkNode[], startIndex: number, skip: boolean): void {
        for (let i = startIndex; i < nodes.length; i++) {
          const node = nodes[i]

          if (typeof node === 'string') {
            if (!skip) {
              nodes[i] = applyPunctuation(
                node,
                enableQuotes,
                dashes,
                ellipsis,
                symbols,
                normalize,
                openDouble,
                closeDouble,
                openSingle,
                closeSingle
              )
            }
            continue
          }

          if (Array.isArray(node) && node[0] != null) {
            walkNodes(node as ComarkNode[], 2, skip || SKIP_TAGS.has(node[0] as string))
          }
        }
      }

      walkNodes(state.tree.nodes, 0, false)
    },
  }
})
