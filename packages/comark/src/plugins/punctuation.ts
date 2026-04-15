import type { ComarkNode } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'

export interface PunctuationOptions {
  /**
   * Convert straight quotes to smart (curly) quotes
   * @default true
   */
  quotes?: boolean

  /**
   * Convert -- to en-dash and --- to em-dash
   * @default true
   */
  dashes?: boolean

  /**
   * Convert ... to ellipsis character
   * @default true
   */
  ellipsis?: boolean

  /**
   * Convert (c), (r), (tm), +- to ©, ®, ™, ±
   * @default true
   */
  symbols?: boolean
}

const OPEN_DOUBLE = '\u201C'
const CLOSE_DOUBLE = '\u201D'
const OPEN_SINGLE = '\u2018'
const CLOSE_SINGLE = '\u2019'

/** Tags whose text content should not be transformed */
const SKIP_TAGS = new Set(['code', 'pre', 'math', 'script', 'style', 'kbd'])

function isWhitespaceOrOpener(code: number): boolean {
  // space, tab, newline, carriage return, (, [, {
  return code === 32 || code === 9 || code === 10 || code === 13
    || code === 40 || code === 91 || code === 123
}

function isLetter(code: number): boolean {
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
}

/**
 * Single-pass text transformation
 * (ellipsis, dashes, symbols, smart quotes) in one scan with no regex.
 */
function applyPunctuation(
  text: string,
  quotes: boolean,
  dashes: boolean,
  ellipsis: boolean,
  symbols: boolean,
): string {
  const len = text.length
  let result = ''

  for (let i = 0; i < len; i++) {
    const code = text.charCodeAt(i)

    // Ellipsis: ...
    if (ellipsis && code === 46 /* . */ && i + 2 < len
      && text.charCodeAt(i + 1) === 46 && text.charCodeAt(i + 2) === 46) {
      result += '\u2026'
      i += 2
      continue
    }

    // Dashes: --- (em-dash) or -- (en-dash)
    if (dashes && code === 45 /* - */ && i + 1 < len && text.charCodeAt(i + 1) === 45) {
      if (i + 2 < len && text.charCodeAt(i + 2) === 45) {
        result += '\u2014'
        i += 2
      }
      else {
        result += '\u2013'
        i += 1
      }
      continue
    }

    // Symbols: (c), (C), (r), (R), (tm), (TM), +-
    if (symbols) {
      if (code === 40 /* ( */) {
        const remaining = len - i
        if (remaining >= 3 && text.charCodeAt(i + 2) === 41 /* ) */) {
          const inner = text.charCodeAt(i + 1)
          // c, C
          if (inner === 99 || inner === 67) {
            result += '\u00A9'
            i += 2
            continue
          }
          // r, R
          if (inner === 114 || inner === 82) {
            result += '\u00AE'
            i += 2
            continue
          }
        }
        if (remaining >= 4 && text.charCodeAt(i + 3) === 41 /* ) */) {
          const c1 = text.charCodeAt(i + 1)
          const c2 = text.charCodeAt(i + 2)
          // t/T, m/M
          if ((c1 === 116 || c1 === 84) && (c2 === 109 || c2 === 77)) {
            result += '\u2122'
            i += 3
            continue
          }
        }
      }
      if (code === 43 /* + */ && i + 1 < len && text.charCodeAt(i + 1) === 45 /* - */) {
        result += '\u00B1'
        i += 1
        continue
      }
    }

    // Smart quotes
    if (quotes) {
      if (code === 34 /* " */) {
        const prevCode = i > 0 ? text.charCodeAt(i - 1) : 32
        result += (isWhitespaceOrOpener(prevCode) || i === 0) ? OPEN_DOUBLE : CLOSE_DOUBLE
        continue
      }
      if (code === 39 /* ' */) {
        const prevCode = i > 0 ? text.charCodeAt(i - 1) : 32
        const nextCode = i + 1 < len ? text.charCodeAt(i + 1) : 0
        // Apostrophe in contractions: letter before AND letter after
        if (isLetter(prevCode) && isLetter(nextCode)) {
          result += CLOSE_SINGLE
        }
        else {
          result += (isWhitespaceOrOpener(prevCode) || i === 0) ? OPEN_SINGLE : CLOSE_SINGLE
        }
        continue
      }
    }

    result += text[i]
  }

  return result
}

/**
 * Punctuation plugin for comark
 *
 * Transforms common punctuation patterns into their typographically correct Unicode characters:
 * - Smart (curly) quotes: "text" → \u201Ctext\u201D, 'text' → \u2018text\u2019
 * - Dashes: -- → \u2013 (en-dash), --- → \u2014 (em-dash)
 * - Ellipsis: ... → \u2026
 * - Symbols: (c) → \u00A9, (r) → \u00AE, (tm) → \u2122, +- → \u00B1
 *
 * Does not transform text inside code, pre, math, kbd, script, or style elements.
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
 * ```
 */
export default defineComarkPlugin((options: PunctuationOptions = {}) => {
  const {
    quotes = true,
    dashes = true,
    ellipsis = true,
    symbols = true,
  } = options

  return {
    name: 'punctuation',
    post(state) {
      function walkNodes(nodes: ComarkNode[], startIndex: number, skip: boolean): void {
        for (let i = startIndex; i < nodes.length; i++) {
          const node = nodes[i]

          if (typeof node === 'string') {
            if (!skip) {
              nodes[i] = applyPunctuation(node, quotes, dashes, ellipsis, symbols)
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
