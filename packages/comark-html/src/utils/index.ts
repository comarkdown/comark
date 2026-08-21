export * from 'comark/utils'

/**
 * Escape a string for safe interpolation into HTML markup. Used by plugin
 * renderers whose fallback output includes author-controlled source.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
