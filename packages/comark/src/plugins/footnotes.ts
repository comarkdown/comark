import type { ComarkNode, ComarkElement, ComarkElementAttributes, ConditionalNodeHandler } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { visit } from '../utils/index.ts'

export interface FootnotesConfig {
  /**
   * The label for the footnotes section
   * @default 'Footnotes'
   */
  label?: string

  /**
   * Whether to add a horizontal rule before the footnotes section
   * @default true
   */
  hr?: boolean

  /**
   * Back-reference symbol
   * @default '↩'
   */
  backRef?: string
}

// Regex to match footnote definitions at the start of a line:
// [^label]: content
const FOOTNOTE_DEF_RE = /^\[\^([^\s\]]+)\]:[ \t]?(.*)$/gm

/**
 * Quick structural check: is this a ['span', {…}, string] tuple?
 * Used as the visit() checker to avoid running the full extraction
 * on every node in the tree.
 */
function maybeFootnoteRef(node: ComarkNode): boolean {
  return Array.isArray(node) && node[0] === 'span' && node.length === 3 && typeof node[2] === 'string'
}

/**
 * Check if a node is a footnote reference: ['span', {}, '^label']
 * The MDC parser converts [^label] into ['span', {}, '^label']
 * Returns the label string or null.
 */
function isFootnoteRef(node: ComarkNode): string | null {
  // Caller should pre-check with maybeFootnoteRef for fast rejection
  const attrs = node[1] as Record<string, any>
  // Check attrs has no keys other than '$' — avoid Object.keys() allocation
  for (const k in attrs) {
    if (k !== '$') return null
  }

  const child = node[2] as string
  // Must start with '^' and have at least one label char
  if (child.charCodeAt(0) !== 0x5e /* ^ */ || child.length < 2) return null

  // Check for whitespace using charCode scanning (avoid regex)
  for (let i = 1; i < child.length; i++) {
    const c = child.charCodeAt(i)
    if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d) return null
  }

  return child.slice(1)
}

/**
 * Create footnotes plugin for comark
 *
 * This plugin adds support for footnote references `[^label]` and
 * footnote definitions `[^label]: content`. Footnotes are collected
 * and rendered as a numbered list at the end of the document.
 *
 * @param config Footnotes configuration
 *
 * @example
 * ```ts
 * import { parse } from 'comark'
 * import footnotes from 'comark/plugins/footnotes'
 *
 * const result = await parse('Hello[^1]\n\n[^1]: World', {
 *   plugins: [footnotes()]
 * })
 * ```
 */
export default defineComarkPlugin((config: FootnotesConfig = {}) => {
  const { label = 'Footnotes', hr = true, backRef = '↩' } = config

  return {
    name: 'footnotes',
    // extract footnote definitions from markdown before MDC parsing
    pre(state) {
      const definitions = new Map<string, string>()

      // Extract and remove footnote definitions from the source
      state.markdown = state.markdown.replace(FOOTNOTE_DEF_RE, (_match, defLabel: string, content: string) => {
        definitions.set(defLabel, content.trim())
        return '' // Remove the definition line
      })

      // Store on state to avoid mixing definitions across parallel parses
      state.footnote = definitions
    },
    // replace [^ref] spans and build footnotes section
    post(state) {
      const definitions: Map<string, string> = state.footnote
      if (!definitions || definitions.size === 0) return

      const refIndexMap = new Map<string, number>()

      // Replace footnote reference spans with sup > a elements
      visit(state.tree, maybeFootnoteRef, (node) => {
        const refLabel = isFootnoteRef(node)
        if (!refLabel || !definitions.has(refLabel)) return

        if (!refIndexMap.has(refLabel)) {
          refIndexMap.set(refLabel, refIndexMap.size + 1)
        }
        const refIndex = refIndexMap.get(refLabel)!

        return [
          'sup',
          { class: 'footnote-ref' },
          [
            'a',
            {
              href: `#fn-${refLabel}`,
              id: `fnref-${refLabel}`,
            },
            `[${refIndex}]`,
          ],
        ]
      })

      let nodes = state.tree.nodes

      // Remove empty paragraphs left after definition removal
      nodes = nodes.filter((node) => {
        if (!Array.isArray(node) || node[0] !== 'p') return true
        // A paragraph with only whitespace children is considered empty
        for (let i = 2; i < node.length; i++) {
          const child = node[i]
          if (typeof child === 'string') {
            if ((child as string).trim().length > 0) return true
          } else if (Array.isArray(child) && child[0] != null) {
            return true
          }
        }
        return false
      })

      // Build the footnotes section
      if (refIndexMap.size === 0) {
        state.tree.nodes = nodes
        return
      }

      const footnoteItems: ComarkNode[] = []

      for (const [refLabel] of refIndexMap) {
        const content = definitions.get(refLabel)!

        footnoteItems.push([
          'li',
          { id: `fn-${refLabel}` },
          content,
          ' ',
          ['a', { href: `#fnref-${refLabel}`, class: 'footnote-backref' }, backRef],
        ])
      }

      const sectionChildren: ComarkNode[] = []
      if (hr) {
        sectionChildren.push(['hr', {}])
      }
      if (label) {
        sectionChildren.push(['h2', { id: 'footnotes' }, label])
      }
      sectionChildren.push(['ol', { class: 'footnotes-list' }, ...footnoteItems])

      nodes.push(['section', { class: 'footnotes' }, ...sectionChildren])

      state.tree.nodes = nodes
    },
  }
})

/**
 * Conditional stringify handler for footnotes.
 *
 * Converts footnote AST nodes back to standard markdown footnote syntax
 * (`[^key]` for references, `[^key]: content` for definitions).
 *
 * @example
 * ```ts
 * import { parse } from 'comark'
 * import { renderMarkdown } from 'comark/render'
 * import footnotes, { Footnote } from 'comark/plugins/footnotes'
 *
 * const tree = await parse('Hello[^1]\n\n[^1]: World', {
 *   plugins: [footnotes()]
 * })
 *
 * const md = await renderMarkdown(tree, {
 *   components: { footnotes: Footnote },
 * })
 * ```
 */
export const Footnote: ConditionalNodeHandler = {
  match: (node) => {
    return node[1].class === 'footnotes' || node[1].class === 'footnote-ref'
  },
  handler: (node) => {
    if (node[1].class === 'footnotes') {
      const ol = node.find((n) => Array.isArray(n) && n[0] === 'ol') as ComarkElement
      if (!ol) return ''
      let result = ''
      for (let i = 2; i < ol.length; i++) {
        const key = String(((ol[i] as ComarkElement)[1] as ComarkElementAttributes)?.id)?.replace('fn-', '')
        const value = (ol[i] as ComarkElement)[2] as string
        result += `[^${key}]: ${value}\n`
      }
      return result
    }
    if (node[1].class === 'footnote-ref') {
      const link = node[2] as ComarkElement
      const key = String((link[1] as ComarkElementAttributes)?.id)?.replace('fnref-', '')
      return `[^${key}]`
    }
    return ''
  },
}
