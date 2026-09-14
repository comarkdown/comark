import type { NodeHandler } from 'comark'

/**
 * HTML component render function for `::email-button` nodes.
 *
 * Parsing of `::email-button` is handled automatically by the core `components`
 * plugin (enabled by default). This handler renders the parsed AST node to an
 * anchor element with Tailwind utility classes that Maizzle then inlines.
 *
 * Supported attributes:
 *   href   — Link destination. Defaults to '#'.
 *   class  — Tailwind utility classes (e.g. 'bg-primary text-white py-3 px-6').
 *
 * @example
 * ```markdown
 * ::email-button{href="https://example.com" class="bg-primary text-white py-3 px-6"}
 * Click Here
 * ::
 * ```
 */
export const EmailButton: NodeHandler = async ([, attrs, ...children], { render }) => {
  const href = String(attrs.href ?? '#')
  const cls = attrs.class ? ` class="${attrs.class}"` : ''
  const content = await render(children)
  return `<a href="${href}"${cls} target="_blank" rel="noopener noreferrer">${content}</a>`
}

/**
 * No-op parser plugin for `::email-button`.
 *
 * `::email-button` is already parsed by the built-in `components` plugin so this
 * plugin does not register any markdown-it rules. It is exported for symmetry
 * with the rest of the plugin ecosystem.
 */
const emailButton = () => ({ name: 'email-button' })
export default emailButton
