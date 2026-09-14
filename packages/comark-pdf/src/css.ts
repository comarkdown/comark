import type { PdfMargin, PdfPageConfig } from './types.ts'

/** Minimal default CSS injected into every assembled PDF document. */
export const DEFAULT_BASE_CSS = '.comark-page-break{break-after:page}'

/**
 * Resolve a margin config to a CSS shorthand string.
 * Accepts either a string ('20mm') or a per-side object.
 */
const resolveMargin = (margin: string | PdfMargin): string => {
  if (typeof margin === 'string') return margin
  const { top = '0', right = top, bottom = top, left = right } = margin
  return `${top} ${right} ${bottom} ${left}`
}

/**
 * Convert a header/footer template string into a CSS `content` value.
 * Supports two tokens:
 *   {{ page }}       → counter(page)
 *   {{ totalPages }} → counter(pages)
 */
const resolveContentValue = (text: string): string => {
  const parts: string[] = []
  const re = /\{\{\s*(\w+)\s*\}\}/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(text)) !== null) {
    const literal = text.slice(last, match.index)
    if (literal) parts.push(`"${literal.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
    const token = match[1]
    if (token === 'page') parts.push('counter(page)')
    else if (token === 'totalPages') parts.push('counter(pages)')
    else parts.push(`"{{ ${token} }}"`)
    last = match.index + match[0].length
  }

  const remaining = text.slice(last)
  if (remaining) parts.push(`"${remaining.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
  return parts.join(' ') || 'none'
}

/**
 * Generate an `@page` CSS rule from a PdfPageConfig.
 * Returns an empty string when no config is provided.
 */
export const frontmatterToPageCss = (pdf?: PdfPageConfig): string => {
  if (!pdf || Object.keys(pdf).length === 0) return ''

  const { format = 'A4', orientation, margin, header, headerLeft, headerRight, footer, footerLeft, footerRight } = pdf

  const sizeDecl = orientation ? `size: ${format} ${orientation};` : `size: ${format};`
  const marginDecl = margin ? `margin: ${resolveMargin(margin)};` : ''

  const marginBoxes: Array<[string, string]> = []
  if (header) marginBoxes.push(['top-center', resolveContentValue(header)])
  if (headerLeft) marginBoxes.push(['top-left', resolveContentValue(headerLeft)])
  if (headerRight) marginBoxes.push(['top-right', resolveContentValue(headerRight)])
  if (footer) marginBoxes.push(['bottom-center', resolveContentValue(footer)])
  if (footerLeft) marginBoxes.push(['bottom-left', resolveContentValue(footerLeft)])
  if (footerRight) marginBoxes.push(['bottom-right', resolveContentValue(footerRight)])

  const inner = [sizeDecl, marginDecl, ...marginBoxes.map(([box, content]) => `@${box}{content:${content}}`)].filter(
    Boolean
  )

  return `@page{${inner.join('')}}`
}
