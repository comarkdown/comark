import type { NodeHandler } from 'comark'

/**
 * HTML component render function for `::email-columns` nodes.
 *
 * Renders a table-based multi-column layout. Each direct child block becomes a
 * table cell. Maizzle inlines the Tailwind classes after rendering.
 *
 * Supported attributes:
 *   class — Tailwind utility classes applied to the outer table.
 *
 * @example
 * ```markdown
 * ::email-columns{class="gap-4"}
 * Left column text.
 *
 * Right column text.
 * ::
 * ```
 */
export const EmailColumns: NodeHandler = async ([, attrs, ...children], { render }) => {
  const cls = attrs.class ? ` class="comark-email-columns ${attrs.class}"` : ' class="comark-email-columns"'
  const cells = await Promise.all(
    children.map(async (child) => {
      const html = await render([child])
      return `<td valign="top">${html}</td>`
    })
  )
  return `<table${cls} width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>${cells.join('')}</tr></table>`
}

/**
 * No-op parser plugin for `::email-columns`.
 *
 * `::email-columns` is already parsed by the built-in `components` plugin so
 * this plugin does not register any markdown-it rules.
 */
const emailColumns = () => ({ name: 'email-columns' })
export default emailColumns
