import type { NodeHandler } from 'comark'

/**
 * HTML component render function for `::email-divider` nodes.
 *
 * Renders a table-based horizontal divider. Table-based markup ensures
 * consistent rendering in Outlook and other legacy email clients.
 *
 * Supported attributes:
 *   class — Tailwind utility classes applied to the inner `<hr>` element.
 *
 * @example
 * ```markdown
 * ::email-divider{class="border-gray-200 my-4"}
 * ::
 * ```
 */
export const EmailDivider: NodeHandler = ([, attrs]) => {
  const cls = attrs.class ? ` class="${attrs.class}"` : ''
  return `<table class="comark-email-divider" width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td><hr${cls} /></td></tr></table>`
}

/**
 * No-op parser plugin for `::email-divider`.
 *
 * `::email-divider` is already parsed by the built-in `components` plugin so
 * this plugin does not register any markdown-it rules.
 */
const emailDivider = () => ({ name: 'email-divider' })
export default emailDivider
