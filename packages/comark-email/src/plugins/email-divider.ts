import type { MjmlNode } from '../types.ts'

/**
 * Convert an `::email-divider` AST node to an mj-divider MjmlNode.
 *
 * Supported attributes:
 *   border-color  — Divider line color. e.g. '#e0e0e0'.
 *   border-width  — Line width. e.g. '1px'.
 *   padding       — e.g. '16px 0'.
 *   class         — Mapped to css-class on the MJML tag.
 *
 * @example
 * ```markdown
 * ::email-divider{border-color="#cccccc" border-width="1px"}
 * ::
 * ```
 */
export const emailDividerToMjml = (node: [string, Record<string, unknown>, ...unknown[]]): MjmlNode => {
  const attrs = node[1]
  const mjAttrs: Record<string, string> = {}
  for (const key of ['border-color', 'border-width', 'padding']) {
    if (attrs[key] !== undefined) mjAttrs[key] = String(attrs[key])
  }
  if (attrs.class && !attrs['css-class']) mjAttrs['css-class'] = String(attrs.class)
  if (attrs['css-class']) mjAttrs['css-class'] = String(attrs['css-class'])
  return { tagName: 'mj-divider', attributes: mjAttrs }
}

/**
 * No-op parser plugin for `::email-divider`.
 *
 * `::email-divider` is already parsed by the built-in `components` plugin.
 */
const emailDivider = () => ({ name: 'email-divider' })
export default emailDivider
