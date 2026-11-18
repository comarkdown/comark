import type { Node, ElementNode, ElementNodeAttributes, ConditionalNodeHandler } from 'comark'
import { defineComarkPlugin } from 'comark'
import { visit } from 'comark/utils'

/** Space, tab, line feed, form feed or carriage return. Defined per file so it stays inlinable on hot paths. */
function isSpaceCode(c: number): boolean {
  return c === 32 || c === 9 || c === 10 || c === 12 || c === 13
}

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

// [^label]: content
const FOOTNOTE_DEF_RE = /^\[\^([^\s\]]+)\]:[ \t]?(.*)$/gm

/**
 * Labels are author-controlled, so they must not leak raw characters into the
 * `id`/`href` fragment values built below. Encode anything outside a safe
 * charset as `-<hex>-` (deterministic, so references and definitions still
 * match after sanitization).
 */
function sanitizeLabel(label: string): string {
  return label.replace(/[^a-zA-Z0-9_-]/g, (char) => `-${char.charCodeAt(0).toString(16)}-`)
}

/**
 * Quick structural check: is this a `['span', {...}, string]` tuple?
 * Used as the visit() checker to avoid running the full extraction
 * on every node in the tree.
 */
function maybeFootnoteRef(node: Node): boolean {
  return Array.isArray(node) && node[0] === 'span' && node.length === 3 && typeof node[2] === 'string'
}

/**
 * Check if a node is a footnote reference (`['span', {}, '^label']`, emitted
 * by the span parser for `[^label]`). Returns the label string or null.
 */
function isFootnoteRef(node: Node): string | null {
  const attrs = node[1] as Record<string, any>
  // Avoid Object.keys() allocation when checking for non-'$' keys.
  for (const k in attrs) {
    if (k !== '$') return null
  }

  const child = node[2] as string
  if (child.charCodeAt(0) !== 0x5e /* ^ */ || child.length < 2) return null

  for (let i = 1; i < child.length; i++) {
    if (isSpaceCode(child.charCodeAt(i))) return null
  }

  return child.slice(1)
}

/**
 * Adds support for footnote references (`[^label]`) and definitions (`[^label]: content`),
 * collected and rendered as a numbered list at the end of the document.
 *
 * @example
 * ```ts
 * import { parseMarkdown } from 'comark'
 * import footnotes from 'comark/plugins/footnotes'
 *
 * const result = await parseMarkdown('Hello[^1]\n\n[^1]: World', {
 *   plugins: [footnotes()]
 * })
 * ```
 */
export default defineComarkPlugin((config: FootnotesConfig = {}) => {
  const { label = 'Footnotes', hr = true, backRef = '↩' } = config

  return {
    name: 'footnotes',
    pre(state) {
      const definitions = new Map<string, string>()

      state.markdown = state.markdown.replace(FOOTNOTE_DEF_RE, (_match, defLabel: string, content: string) => {
        definitions.set(defLabel, content.trim())
        return ''
      })

      // Store on state to avoid mixing definitions across parallel parses
      state.footnote = definitions
    },
    post(state) {
      const definitions: Map<string, string> = state.footnote
      if (!definitions || definitions.size === 0) return

      const refIndexMap = new Map<string, number>()

      visit(state.tree, maybeFootnoteRef, (node) => {
        const refLabel = isFootnoteRef(node)
        if (!refLabel || !definitions.has(refLabel)) return

        if (!refIndexMap.has(refLabel)) {
          refIndexMap.set(refLabel, refIndexMap.size + 1)
        }
        const refIndex = refIndexMap.get(refLabel)!
        const safeLabel = sanitizeLabel(refLabel)

        return [
          'sup',
          { class: 'footnote-ref' },
          [
            'a',
            {
              href: `#fn-${safeLabel}`,
              id: `fnref-${safeLabel}`,
            },
            `[${refIndex}]`,
          ],
        ]
      })

      let nodes = state.tree.nodes

      // Remove empty paragraphs left after definition removal
      nodes = nodes.filter((node) => {
        if (!Array.isArray(node) || node[0] !== 'p') return true
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

      if (refIndexMap.size === 0) {
        state.tree.nodes = nodes
        return
      }

      const footnoteItems: Node[] = []

      for (const [refLabel] of refIndexMap) {
        const content = definitions.get(refLabel)!
        const safeLabel = sanitizeLabel(refLabel)

        footnoteItems.push([
          'li',
          { id: `fn-${safeLabel}` },
          content,
          ' ',
          ['a', { href: `#fnref-${safeLabel}`, class: 'footnote-backref' }, backRef],
        ])
      }

      const sectionChildren: Node[] = []
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
 * import { parseMarkdown } from 'comark'
 * import { renderMarkdown } from 'comark/render'
 * import footnotes, { Footnote } from 'comark/plugins/footnotes'
 *
 * const document = await parseMarkdown('Hello[^1]\n\n[^1]: World', {
 *   plugins: [footnotes()]
 * })
 *
 * const md = await renderMarkdown(document, {
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
      const ol = node.find((n) => Array.isArray(n) && n[0] === 'ol') as ElementNode
      if (!ol) return ''
      let result = ''
      for (let i = 2; i < ol.length; i++) {
        const key = String(((ol[i] as ElementNode)[1] as ElementNodeAttributes)?.id)?.replace('fn-', '')
        const value = (ol[i] as ElementNode)[2] as string
        result += `[^${key}]: ${value}\n`
      }
      return result
    }
    if (node[1].class === 'footnote-ref') {
      const link = node[2] as ElementNode
      const key = String((link[1] as ElementNodeAttributes)?.id)?.replace('fnref-', '')
      return `[^${key}]`
    }
    return ''
  },
}
