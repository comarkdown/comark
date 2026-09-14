import type { Node, ElementNode, MarkdownDocument } from 'comark'
import { renderHtmlFromDocument } from '@comark/html/render'
import type { EmailConfig, EmailRendererOptions, MjmlNode } from './types.ts'
import { buildMjmlHead } from './config.ts'
import { emailButtonToMjml } from './plugins/email-button.ts'
import { emailColumnsToMjml } from './plugins/email-columns.ts'
import { emailDividerToMjml } from './plugins/email-divider.ts'

// Map heading tags to fixed font sizes.
const HEADING_SIZES: Record<string, string> = {
  h1: '28px',
  h2: '24px',
  h3: '20px',
  h4: '18px',
  h5: '16px',
  h6: '14px',
}

const HEADING_WEIGHTS: Record<string, string> = {
  h1: '700',
  h2: '700',
  h3: '700',
  h4: '600',
  h5: '600',
  h6: '600',
}

// Tags rendered inline inside mj-text content (not as standalone MJML nodes).
const INLINE_TAGS = new Set(['strong', 'em', 'del', 'code', 'a', 'br', 'span'])

/**
 * Render children of a node to an inline HTML string via @comark/html.
 */
const renderInlineHtml = async (children: Node[], options?: EmailRendererOptions): Promise<string> => {
  if (children.length === 0) return ''
  return renderHtmlFromDocument({ nodes: children }, options)
}

/**
 * Render an entire node (including its wrapper tag) to an HTML string.
 */
const renderNodeHtml = async (node: Node, options?: EmailRendererOptions): Promise<string> => {
  return renderHtmlFromDocument({ nodes: [node] }, options)
}

/**
 * Return true when a paragraph contains only a single block image.
 */
const isSoloImage = (node: ElementNode): boolean => {
  const children = node.slice(2) as Node[]
  if (children.length !== 1) return false
  const child = children[0]
  return Array.isArray(child) && child[0] === 'img'
}

/**
 * Convert a single top-level AST node to mj-column child MjmlNode(s).
 *
 * Returns null for email-columns nodes, which need their own mj-section.
 * This function is also exported for use by emailColumnsToMjml to process
 * individual column contents.
 */
export const nodeToColumnChildren = async (node: Node, options?: EmailRendererOptions): Promise<MjmlNode[] | null> => {
  // Text nodes at top level become mj-text
  if (typeof node === 'string') {
    const text = node.trim()
    if (!text) return []
    return [{ tagName: 'mj-text', attributes: {}, content: text }]
  }

  // Comment nodes — skip
  if (node[0] === null) return []

  const [tag, attrs] = node as ElementNode
  const children = (node as ElementNode).slice(2) as Node[]

  // email-columns needs its own section — signal the caller.
  if (tag === 'email-columns') return null

  // email-button → mj-button (valid directly inside mj-column)
  if (tag === 'email-button') {
    const btn = await emailButtonToMjml(node as [string, Record<string, unknown>, ...Node[]], options)
    return [btn]
  }

  // email-divider → mj-divider
  if (tag === 'email-divider') {
    return [emailDividerToMjml(node as [string, Record<string, unknown>, ...Node[]])]
  }

  // Headings
  if (tag in HEADING_SIZES) {
    const content = await renderInlineHtml(children, options)
    return [
      {
        tagName: 'mj-text',
        attributes: {
          'font-size': HEADING_SIZES[tag],
          'font-weight': HEADING_WEIGHTS[tag],
          padding: '16px 0 4px',
        },
        content,
      },
    ]
  }

  // Paragraph — check for solo block image first
  if (tag === 'p') {
    if (isSoloImage(node as ElementNode)) {
      const imgNode = children[0] as ElementNode
      const imgAttrs = imgNode[1] as Record<string, unknown>
      const mjImage: MjmlNode = {
        tagName: 'mj-image',
        attributes: {
          src: String(imgAttrs.src ?? ''),
          alt: String(imgAttrs.alt ?? ''),
        },
      }
      if (imgAttrs.href) mjImage.attributes.href = String(imgAttrs.href)
      if (imgAttrs.width) mjImage.attributes.width = String(imgAttrs.width)
      return [mjImage]
    }
    const content = await renderInlineHtml(children, options)
    return [{ tagName: 'mj-text', attributes: {}, content }]
  }

  // Blockquote
  if (tag === 'blockquote') {
    const content = await renderInlineHtml(children, options)
    return [
      {
        tagName: 'mj-text',
        attributes: { 'padding-left': '16px', 'border-left': '4px solid #ccc' },
        content,
      },
    ]
  }

  // Lists — render the entire list HTML inside mj-text
  if (tag === 'ul' || tag === 'ol') {
    const content = await renderNodeHtml(node, options)
    return [{ tagName: 'mj-text', attributes: {}, content }]
  }

  // Code block / pre
  if (tag === 'pre') {
    const content = await renderNodeHtml(node, options)
    return [
      {
        tagName: 'mj-text',
        attributes: { 'font-family': 'monospace', 'background-color': '#f6f8fa', padding: '16px' },
        content,
      },
    ]
  }

  // Horizontal rule
  if (tag === 'hr') {
    return [{ tagName: 'mj-divider', attributes: { 'border-color': '#e0e0e0' } }]
  }

  // Table
  if (tag === 'table') {
    const content = await renderNodeHtml(node, options)
    return [{ tagName: 'mj-table', attributes: {}, content }]
  }

  // Raw HTML block
  if (attrs?.$?.html === 1) {
    const content = await renderNodeHtml(node, options)
    return [{ tagName: 'mj-raw', attributes: {}, content }]
  }

  // Inline tags at top level — wrap in mj-text
  if (INLINE_TAGS.has(String(tag))) {
    const content = await renderNodeHtml(node, options)
    return [{ tagName: 'mj-text', attributes: {}, content }]
  }

  // Unknown custom components — render via @comark/html and wrap in mj-raw
  const content = await renderNodeHtml(node, options)
  if (!content.trim()) return []
  return [{ tagName: 'mj-raw', attributes: {}, content }]
}

/** Flush the current column children buffer as a single mj-section > mj-column. */
const flushSection = (buffer: MjmlNode[]): MjmlNode | null => {
  if (buffer.length === 0) return null
  return {
    tagName: 'mj-section',
    attributes: {},
    children: [{ tagName: 'mj-column', attributes: {}, children: [...buffer] }],
  }
}

/**
 * Convert a MarkdownDocument to the root MjmlNode JSON tree.
 *
 * The returned tree can be passed directly to compileMjml or serialized via serializeMjml.
 */
export const documentToMjmlJson = async (
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: EmailRendererOptions & { email?: EmailConfig }
): Promise<MjmlNode> => {
  const email = options?.email ?? {}
  const head = buildMjmlHead(email, options?.headCss)

  const bodySections: MjmlNode[] = []
  const columnBuffer: MjmlNode[] = []

  for (const node of document.nodes) {
    const isEmailColumns = Array.isArray(node) && node[0] === 'email-columns'

    if (isEmailColumns) {
      const flushed = flushSection(columnBuffer)
      if (flushed) bodySections.push(flushed)
      columnBuffer.length = 0
      bodySections.push(
        await emailColumnsToMjml(
          node as [string, Record<string, unknown>, ...Node[]],
          (child, opts) => nodeToColumnChildren(child, opts).then((r) => r ?? []),
          options
        )
      )
      continue
    }

    const colChildren = await nodeToColumnChildren(node, options)
    // null should not happen for non-email-columns nodes, but guard anyway.
    if (colChildren !== null) {
      columnBuffer.push(...colChildren)
    }
  }

  const flushed = flushSection(columnBuffer)
  if (flushed) bodySections.push(flushed)

  const bodyAttrs: Record<string, string> = {}
  if (email.theme?.background) {
    bodyAttrs['background-color'] = email.theme.background
  }

  return {
    tagName: 'mjml',
    attributes: {},
    children: [head, { tagName: 'mj-body', attributes: bodyAttrs, children: bodySections }],
  }
}
