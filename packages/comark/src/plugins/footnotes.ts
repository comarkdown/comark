import type { ComarkElement, ComarkNode } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'

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
 * Check if a node is a footnote reference: ['span', {}, '^label']
 * The MDC parser converts [^label] into ['span', {}, '^label']
 */
function isFootnoteRef(node: ComarkNode): string | null {
  if (!Array.isArray(node) || node[0] !== 'span') return null
  if (node.length !== 3) return null

  const attrs = node[1] as Record<string, any>
  const keys = Object.keys(attrs).filter(k => k !== '$')
  if (keys.length > 0) return null

  const child = node[2]
  if (typeof child !== 'string' || !child.startsWith('^')) return null

  const label = child.slice(1)
  if (!label || /\s/.test(label)) return null

  return label
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
  const {
    label = 'Footnotes',
    hr = true,
    backRef = '↩',
  } = config

  // Store definitions extracted during `pre` for use in `post`
  let definitions: Map<string, string>

  return {
    name: 'footnotes',
    // extract footnote definitions from markdown before MDC parsing
    pre(state) {
      definitions = new Map<string, string>()

      // Extract and remove footnote definitions from the source
      state.markdown = state.markdown.replace(FOOTNOTE_DEF_RE, (_match, defLabel: string, content: string) => {
        definitions.set(defLabel, content.trim())
        return '' // Remove the definition line
      })
    },
    // replace [^ref] spans and build footnotes section
    post(state) {
      if (!definitions || definitions.size === 0) return

      const refIndexMap = new Map<string, number>()

      // Replace footnote reference spans with sup > a elements
      function processNodes(nodes: ComarkNode[]): ComarkNode[] {
        const result: ComarkNode[] = []

        for (const node of nodes) {
          if (typeof node === 'string') {
            result.push(node)
            continue
          }

          if (!Array.isArray(node) || node[0] == null) {
            result.push(node)
            continue
          }

          // Check if this is a footnote reference span
          const refLabel = isFootnoteRef(node)
          if (refLabel && definitions.has(refLabel)) {
            if (!refIndexMap.has(refLabel)) {
              refIndexMap.set(refLabel, refIndexMap.size + 1)
            }
            const refIndex = refIndexMap.get(refLabel)!

            result.push(['sup', { class: 'footnote-ref' },
              ['a', {
                href: `#fn-${refLabel}`,
                id: `fnref-${refLabel}`,
              }, `[${refIndex}]`],
            ])
            continue
          }

          // Recurse into children of element nodes
          const [tag, attrs, ...children] = node as ComarkElement
          const processedChildren = processNodes(children as ComarkNode[])
          result.push([tag, attrs, ...processedChildren] as ComarkNode)
        }

        return result
      }

      let nodes = processNodes(state.tree.nodes)
      // state.tree.nodes = processNodes(state.tree.nodes)

      // Remove empty paragraphs left after definition removal
      nodes = nodes.filter((node) => {
        if (!Array.isArray(node) || node[0] !== 'p') return true
        // A paragraph with only whitespace children is considered empty
        const children = (node as ComarkElement).slice(2)
        return children.some((child) => {
          if (typeof child === 'string') {
            return child.trim().length > 0
          }
          // Keep if meaningful element exists
          return Array.isArray(child) && child[0] != null
        })
      })

      // Build the footnotes section
      if (refIndexMap.size === 0) {
        state.tree.nodes = nodes
        return
      }

      const footnoteItems: ComarkNode[] = []

      for (const [refLabel] of refIndexMap) {
        const content = definitions.get(refLabel)!

        footnoteItems.push(
          ['li', { id: `fn-${refLabel}` },
            content, ' ',
            ['a', { href: `#fnref-${refLabel}`, class: 'footnote-backref' }, backRef],
          ],
        )
      }

      const sectionChildren: ComarkNode[] = []
      if (hr) {
        sectionChildren.push(['hr', {}])
      }
      if (label) {
        sectionChildren.push(['h2', { id: 'footnotes' }, label])
      }
      sectionChildren.push(['ol', { class: 'footnotes-list' }, ...footnoteItems])

      nodes.push(
        ['section', { class: 'footnotes' }, ...sectionChildren],
      )

      state.tree.nodes = nodes
    },
  }
})
