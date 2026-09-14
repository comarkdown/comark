import type { MjmlNode } from './types.ts'

/** Escape characters that are invalid inside XML attribute values and text content. */
const escapeXml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Serialize a MjmlNode tree to an MJML XML string.
 *
 * Used for tests, debugging, and as an alternative input to compileMjml.
 * Note: content is NOT escaped — it is treated as raw HTML (intentional for mj-text, mj-raw, etc.).
 */
export const serializeMjml = (node: MjmlNode, depth = 0): string => {
  const indent = '  '.repeat(depth)
  const attrs = Object.entries(node.attributes)
    .map(([k, v]) => ` ${k}="${escapeXml(v)}"`)
    .join('')

  if (!node.children?.length && node.content === undefined) {
    return `${indent}<${node.tagName}${attrs} />`
  }

  const inner: string[] = []
  if (node.content !== undefined) {
    inner.push(node.content)
  }
  for (const child of node.children ?? []) {
    inner.push(serializeMjml(child, depth + 1))
  }

  const body = inner.join('\n')
  // If content is a single short string with no children, keep it on one line.
  if (!node.children?.length && typeof node.content === 'string' && !node.content.includes('\n')) {
    return `${indent}<${node.tagName}${attrs}>${node.content}</${node.tagName}>`
  }
  return `${indent}<${node.tagName}${attrs}>\n${body}\n${indent}</${node.tagName}>`
}
