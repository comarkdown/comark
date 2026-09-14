import type { Node } from 'comark'
import type { EmailRendererOptions, MjmlNode } from '../types.ts'

/**
 * Convert an `::email-columns` AST node to an mj-section MjmlNode.
 *
 * Each direct child block becomes an mj-column. The caller must ensure the
 * columns node maps to a standalone mj-section (not nested inside another section).
 *
 * Supported section attributes:
 *   background-color — Section fill color.
 *   padding          — Section padding.
 *   class            — Mapped to css-class on the MJML tag.
 *
 * @example
 * ```markdown
 * ::email-columns{background-color="#f9f9f9"}
 * Left column content.
 *
 * Right column content.
 * ::
 * ```
 */
export const emailColumnsToMjml = async (
  node: [string, Record<string, unknown>, ...Node[]],
  nodeToMjml: (child: Node, options?: EmailRendererOptions) => Promise<MjmlNode[]>,
  options?: EmailRendererOptions
): Promise<MjmlNode> => {
  const attrs = node[1]
  const children = node.slice(2) as Node[]

  const columns: MjmlNode[] = await Promise.all(
    children.map(async (child) => {
      const colChildren = await nodeToMjml(child, options)
      return {
        tagName: 'mj-column',
        attributes: {},
        children: colChildren,
      }
    })
  )

  const sectionAttrs: Record<string, string> = {}
  for (const key of ['background-color', 'padding']) {
    if (attrs[key] !== undefined) sectionAttrs[key] = String(attrs[key])
  }
  if (attrs.class && !attrs['css-class']) sectionAttrs['css-class'] = String(attrs.class)
  if (attrs['css-class']) sectionAttrs['css-class'] = String(attrs['css-class'])

  return { tagName: 'mj-section', attributes: sectionAttrs, children: columns }
}

/**
 * No-op parser plugin for `::email-columns`.
 *
 * `::email-columns` is already parsed by the built-in `components` plugin.
 */
const emailColumns = () => ({ name: 'email-columns' })
export default emailColumns
