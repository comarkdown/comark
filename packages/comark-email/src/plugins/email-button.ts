import type { Node } from 'comark'
import { renderHtmlFromDocument } from '@comark/html/render'
import type { EmailRendererOptions, MjmlNode } from '../types.ts'

/**
 * Convert an `::email-button` AST node to an mj-button MjmlNode.
 *
 * Supported attributes:
 *   href              — Link destination. Defaults to '#'.
 *   background-color  — Button fill color (falls back to mj-attributes default).
 *   color             — Text color.
 *   align             — 'left' | 'center' | 'right'.
 *   border-radius     — e.g. '4px'.
 *   font-size         — e.g. '15px'.
 *   width             — e.g. '200px'.
 *   target            — e.g. '_blank'.
 *   padding           — e.g. '12px 24px'.
 *   class             — Mapped to css-class on the MJML tag.
 *
 * @example
 * ```markdown
 * ::email-button{href="https://example.com" background-color="#0066cc" color="#fff"}
 * Click Here
 * ::
 * ```
 */
export const emailButtonToMjml = async (
  node: [string, Record<string, unknown>, ...Node[]],
  options?: EmailRendererOptions
): Promise<MjmlNode> => {
  const attrs = node[1]
  const children = node.slice(2) as Node[]
  const content = children.length ? await renderHtmlFromDocument({ nodes: children }, options) : ''

  const mjAttrs: Record<string, string> = { href: String(attrs.href ?? '#') }
  const passthrough = ['background-color', 'color', 'align', 'border-radius', 'font-size', 'width', 'target', 'padding']
  for (const key of passthrough) {
    if (attrs[key] !== undefined) mjAttrs[key] = String(attrs[key])
  }
  if (attrs.class) mjAttrs['css-class'] = String(attrs.class)

  return { tagName: 'mj-button', attributes: mjAttrs, content }
}

/**
 * No-op parser plugin for `::email-button`.
 *
 * `::email-button` is already parsed by the built-in `components` plugin.
 * This plugin is exported for symmetry with the rest of the plugin ecosystem.
 */
const emailButton = () => ({ name: 'email-button' })
export default emailButton
