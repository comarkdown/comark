import {
  Column,
  Row,
  Box,
  Text,
  Paragraph,
  Divider,
  Table,
  Padding,
  PageBreak,
  span,
} from '@jasy/pdf'
import type { Node, ElementNode } from 'comark'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JasyNode = any

/** Override hook: replace a tag's default mapping with a custom jasy node factory. */
export type JasyComponentFn = (element: ElementNode, ctx: JasyMapContext) => JasyNode | null

/** Optional body text defaults (from `pdf.fontSize` / `pdf.color` / …). */
export interface JasyTextDefaults {
  size?: number
  font?: string | string[]
  color?: string
  lineHeight?: number
  align?: 'left' | 'center' | 'right' | 'justify'
  bold?: boolean
  italic?: boolean
}

export interface JasyMapContext {
  mapNodes(nodes: Node[]): JasyNode[]
  mapInlineToSpans(nodes: Node[], inheritStyle?: Record<string, unknown>): ReturnType<typeof span>[]
  components?: Record<string, JasyComponentFn>
  textDefaults?: JasyTextDefaults
}

const HEADING_SIZES = [28, 22, 18, 16, 14, 13] as const

const DEFAULT_BODY_SIZE = 12

/** Style bag for body Text / Paragraph, merging configured document defaults. */
const bodyTextStyle = (
  ctx: JasyMapContext,
  extra: Record<string, unknown> = {},
): Record<string, unknown> => {
  const d = ctx.textDefaults
  return {
    size: d?.size ?? DEFAULT_BODY_SIZE,
    ...(d?.font !== undefined ? { font: d.font } : {}),
    ...(d?.color !== undefined ? { color: d.color } : {}),
    ...(d?.lineHeight !== undefined ? { lineHeight: d.lineHeight } : {}),
    ...(d?.align !== undefined ? { align: d.align } : {}),
    ...(d?.bold !== undefined ? { bold: d.bold } : {}),
    ...(d?.italic !== undefined ? { italic: d.italic } : {}),
    ...extra,
  }
}

/**
 * Recursively collect plain text from a node subtree.
 * Used as fallback when span building is complex.
 */
const textContent = (nodes: Node[]): string =>
  nodes
    .map((n) => {
      if (typeof n === 'string') return n
      const [, , ...children] = n as ElementNode
      return textContent(children)
    })
    .join('')

/**
 * Map inline AST nodes to jasy span objects.
 * Styles compose: a bold-italic node becomes { bold: true, italic: true }.
 */
const mapInlineToSpans = (
  nodes: Node[],
  inheritStyle: Record<string, unknown> = {},
): ReturnType<typeof span>[] => {
  const result: ReturnType<typeof span>[] = []

  for (const node of nodes) {
    if (typeof node === 'string') {
      if (node) result.push(span(node, inheritStyle))
      continue
    }

    const [tag, attrs, ...children] = node as ElementNode
    const style = { ...inheritStyle }

    switch (tag) {
      case 'strong':
        style.bold = true
        break
      case 'em':
        style.italic = true
        break
      case 'code':
        style.font = 'Courier'
        break
      case 'a':
        style.href = String(attrs.href ?? '')
        style.color = '#1450aa'
        style.underline = true
        break
      case 'br':
        result.push(span('\n', inheritStyle))
        continue
      case 's':
      case 'del':
        style.strikethrough = true
        break
      // Passthrough tags (del, mark, etc.): inherit style only
    }

    if (children.length > 0) {
      result.push(...mapInlineToSpans(children, style))
    }
  }

  return result
}

/**
 * Build the content arg for Text/Paragraph from inline children.
 * Returns a string when the result is plain (no spans needed), otherwise a span array.
 */
const inlineContent = (
  children: Node[],
): string | ReturnType<typeof span>[] => {
  const spans = mapInlineToSpans(children)
  if (spans.length === 0) return ''
  if (spans.length === 1 && Object.keys(spans[0]).length <= 1) {
    // Single unstyled span — return plain string
    return (spans[0] as { text?: string }).text ?? ''
  }
  return spans
}

/** Map a list item's children, flattening the top-level paragraph wrapper. */
const mapListItem = (
  children: Node[],
  ctx: JasyMapContext,
): JasyNode[] => {
  if (children.length === 1) {
    const child = children[0]
    if (Array.isArray(child) && (child as ElementNode)[0] === 'p') {
      const [, , ...pChildren] = child as ElementNode
      const content = inlineContent(pChildren)
      return [Text(content, bodyTextStyle(ctx))]
    }
  }
  return ctx.mapNodes(children)
}

/** Map a GFM table thead or tbody cells to a row array (flat cell array). */
const mapTableRow = (node: ElementNode, ctx: JasyMapContext): JasyNode[] => {
  const [, , ...cells] = node
  return cells.flatMap((cell) => {
    if (typeof cell === 'string') return [Text(cell, bodyTextStyle(ctx))]
    const [, attrs, ...children] = cell as ElementNode
    const content = inlineContent(children)
    const align = String(attrs.align ?? 'left') as 'left' | 'center' | 'right'
    return [Text(content as string, bodyTextStyle(ctx, { align }))]
  })
}

/**
 * Map a single block-level AST node to one or more jasy nodes.
 * Returns `null` for nodes that produce no output (e.g. empty comments).
 */
const mapBlockNode = (node: Node, ctx: JasyMapContext): JasyNode | JasyNode[] | null => {
  if (typeof node === 'string') {
    const text = node.trim()
    return text ? Text(text, bodyTextStyle(ctx)) : null
  }

  const [tag, attrs, ...children] = node as ElementNode

  // Null comment nodes
  if (tag === null) return null

  // Custom component override
  if (ctx.components?.[tag]) {
    return ctx.components[tag](node as ElementNode, ctx)
  }

  switch (tag) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const level = parseInt(tag[1]) - 1
      const content = inlineContent(children)
      return Text(content as string, {
        size: HEADING_SIZES[level],
        bold: level < 2,
        ...(ctx.textDefaults?.font !== undefined ? { font: ctx.textDefaults.font } : {}),
        ...(ctx.textDefaults?.color !== undefined ? { color: ctx.textDefaults.color } : {}),
      })
    }

    case 'p': {
      const content = inlineContent(children)
      if (!content || (typeof content === 'string' && !content.trim())) return null
      return Paragraph(content as string, bodyTextStyle(ctx))
    }

    case 'blockquote': {
      const inner = ctx.mapNodes(children)
      return Box(
        { borderLeft: '#aaaaaa', borderWidth: 3, padding: { left: 12, top: 4, bottom: 4 } },
        inner.length > 0 ? inner : [Text('')],
      )
    }

    case 'pre': {
      // code block — render as monospace text in a tinted box
      const code = textContent(children).trimEnd()
      return Box(
        { bg: '#f6f8fa', padding: 12, radius: 4 },
        [Text(code, { font: 'Courier', size: 10 })],
      )
    }

    case 'hr':
      return Divider({ color: '#cccccc', margin: { y: 8 } })

    case 'ul': {
      const items = children.map((child) => {
        if (typeof child === 'string') return null
        const [itemTag, , ...itemChildren] = child as ElementNode
        if (itemTag !== 'li') return null
        const inner = mapListItem(itemChildren, ctx)
        return Row({ gap: 6, align: 'start' }, [
          Text('•', bodyTextStyle(ctx, { color: '#666666' })),
          Column({ gap: 4 }, inner.length > 0 ? inner : [Text('')]),
        ])
      })
      const filteredItems = items.filter(Boolean) as JasyNode[]
      return Column({ gap: 6 }, filteredItems.length > 0 ? filteredItems : [Text('')])
    }

    case 'ol': {
      const items = children.map((child, i) => {
        if (typeof child === 'string') return null
        const [itemTag, , ...itemChildren] = child as ElementNode
        if (itemTag !== 'li') return null
        const inner = mapListItem(itemChildren, ctx)
        return Row({ gap: 6, align: 'start' }, [
          Text(`${i + 1}.`, bodyTextStyle(ctx, { color: '#666666' })),
          Column({ gap: 4 }, inner.length > 0 ? inner : [Text('')]),
        ])
      })
      const filteredItems = items.filter(Boolean) as JasyNode[]
      return Column({ gap: 6 }, filteredItems.length > 0 ? filteredItems : [Text('')])
    }

    case 'li': {
      const inner = mapListItem(children, ctx)
      return Column({ gap: 4 }, inner.length > 0 ? inner : [Text('')])
    }

    case 'table': {
      // Find thead and tbody
      const thead = children.find(
        (c) => Array.isArray(c) && (c as ElementNode)[0] === 'thead',
      ) as ElementNode | undefined
      const tbody = children.find(
        (c) => Array.isArray(c) && (c as ElementNode)[0] === 'tbody',
      ) as ElementNode | undefined

      const headerRowNode = thead
        ? (thead[2] as ElementNode | undefined)
        : undefined
      const headerCells = headerRowNode ? mapTableRow(headerRowNode, ctx) : undefined

      const bodyRowNodes = tbody
        ? (tbody as ElementNode).slice(2).filter(Array.isArray) as ElementNode[]
        : []

      const numCols = headerCells?.length ?? (bodyRowNodes[0] ? mapTableRow(bodyRowNodes[0], ctx).length : 1)
      const columns = Array.from({ length: numCols }, () => '1fr' as '1fr')

      const rows = bodyRowNodes.map((rowNode) => mapTableRow(rowNode, ctx))

      return Table(
        {
          columns,
          header: headerCells,
          cellPadding: { x: 8, y: 6 },
          rule: '#cccccc',
        },
        rows,
      )
    }

    case 'img': {
      // Images require local file paths in Node; render alt text as fallback
      const alt = String(attrs.alt ?? '')
      return Text(alt ? `[Image: ${alt}]` : '[Image]', { italic: true, color: '#666666', size: 11 })
    }

    case 'a': {
      // Block-level anchor (rare) — render children
      const inner = ctx.mapNodes(children)
      return inner.length === 1 ? inner[0] : Column({ gap: 4 }, inner)
    }

    case 'div':
      // Generic div — render children
      return ctx.mapNodes(children)

    case 'page-break': {
      return PageBreak()
    }

    // Passthrough: render children as block column
    default: {
      const inner = ctx.mapNodes(children)
      if (inner.length === 0) return null
      return inner.length === 1 ? inner[0] : Column({ gap: 8 }, inner)
    }
  }
}

/** Map an array of AST nodes to jasy nodes, flattening arrays and dropping nulls. */
const mapNodes = (nodes: Node[], ctx: JasyMapContext): JasyNode[] => {
  const result: JasyNode[] = []
  for (const node of nodes) {
    const mapped = mapBlockNode(node, ctx)
    if (mapped === null) continue
    if (Array.isArray(mapped)) result.push(...mapped)
    else result.push(mapped)
  }
  return result
}

/**
 * Map an array of Comark AST nodes to a jasy column of block-level nodes.
 * Optionally pass `components` to override rendering of specific tags.
 */
export const astToJasy = (
  nodes: Node[],
  components?: Record<string, JasyComponentFn>,
  textDefaults?: JasyTextDefaults,
): JasyNode[] => {
  const ctx: JasyMapContext = {
    mapNodes: (ns) => mapNodes(ns, ctx),
    mapInlineToSpans: (ns, style) => mapInlineToSpans(ns, style),
    components,
    textDefaults,
  }
  return mapNodes(nodes, ctx)
}
