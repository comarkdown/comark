/**
 * DOM-heavier HTML parsing filters.
 *
 * These are intentionally excluded from `standardFilters` and must be
 * imported explicitly:
 *
 *   import { htmlFilters } from 'comark/utils/filters/html'
 *
 * This mirrors knap's `html` filter group — kept separate so applications
 * that never need HTML→JSON conversion do not pay the parse cost.
 */
import { Parser } from 'htmlparser2'
import type { BindingFilters } from './types.ts'

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

interface HtmlNode {
  type: 'element' | 'text' | 'comment'
  tag?: string
  attrs?: Record<string, string>
  children?: HtmlNode[]
  value?: string
}

const parseToTree = (html: string): HtmlNode[] => {
  const root: HtmlNode[] = []
  const stack: HtmlNode[][] = [root]

  const parser = new Parser(
    {
      onopentag(tag, attribs) {
        const node: HtmlNode = { type: 'element', tag, attrs: { ...attribs }, children: [] }
        stack[stack.length - 1].push(node)
        if (!VOID_TAGS.has(tag)) stack.push(node.children!)
      },
      onclosetag(tag, isImplied) {
        if (!VOID_TAGS.has(tag) && !isImplied && stack.length > 1) stack.pop()
      },
      ontext(text) {
        const trimmed = text.trim()
        if (trimmed) stack[stack.length - 1].push({ type: 'text', value: text })
      },
      oncomment(text) {
        stack[stack.length - 1].push({ type: 'comment', value: text })
      },
    },
    { decodeEntities: false, lowerCaseTags: true, lowerCaseAttributeNames: true }
  )

  parser.write(html)
  parser.end()
  return root
}

const serializeTree = (nodes: HtmlNode[]): string => {
  const parts: string[] = []
  for (const node of nodes) {
    if (node.type === 'text') {
      parts.push(node.value ?? '')
    } else if (node.type === 'comment') {
      parts.push(`<!--${node.value}-->`)
    } else if (node.type === 'element') {
      const attrStr = node.attrs
        ? Object.entries(node.attrs)
            .map(([k, v]) => (v === '' ? k : `${k}="${v}"`))
            .join(' ')
        : ''
      parts.push(attrStr ? `<${node.tag} ${attrStr}>` : `<${node.tag}>`)
      if (node.children && !VOID_TAGS.has(node.tag!)) {
        parts.push(serializeTree(node.children))
        parts.push(`</${node.tag}>`)
      }
    }
  }
  return parts.join('')
}

const filterTree = (nodes: HtmlNode[], removeTags: Set<string>): HtmlNode[] => {
  const result: HtmlNode[] = []
  for (const node of nodes) {
    if (node.type === 'element' && removeTags.has(node.tag!)) continue
    if (node.type === 'element' && node.children) {
      result.push({ ...node, children: filterTree(node.children, removeTags) })
    } else {
      result.push(node)
    }
  }
  return result
}

export const htmlFilters: BindingFilters = {
  html_to_json: (v) => {
    const html = String(v ?? '')
    const tree = parseToTree(html)
    // Simplify single-root case
    const clean = (nodes: HtmlNode[]): unknown => {
      const out = nodes.map((n): unknown => {
        if (n.type === 'text') return { type: 'text', value: n.value }
        if (n.type === 'comment') return { type: 'comment', value: n.value }
        const obj: Record<string, unknown> = { type: 'element', tag: n.tag }
        if (n.attrs && Object.keys(n.attrs).length > 0) obj.attrs = n.attrs
        if (n.children && n.children.length > 0) obj.children = clean(n.children)
        return obj
      })
      return out.length === 1 ? out[0] : out
    }
    return clean(tree)
  },
  remove_html: (v, ...tags) => {
    const html = String(v ?? '')
    const tagSet = new Set(tags.map((t) => String(t).toLowerCase()))
    const tree = parseToTree(html)
    return serializeTree(filterTree(tree, tagSet))
  },
}
