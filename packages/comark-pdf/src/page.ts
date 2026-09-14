import { Row, Text, PageNumber, PageCount } from '@jasy/pdf'
import type { PdfMargin, PdfPageConfig } from './types.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JasyNode = any

/** Convert a CSS length string (e.g. "20mm", "1in") to PDF points. */
const parseLengthToPt = (val: string): number => {
  const n = parseFloat(val)
  if (val.endsWith('mm')) return n * (72 / 25.4)
  if (val.endsWith('cm')) return n * (720 / 25.4)
  if (val.endsWith('in')) return n * 72
  return n // assume pt
}

/** Resolve a PdfMargin to a value accepted by jasy (number or per-side object). */
export const resolveJasyMargin = (
  margin: string | PdfMargin,
): number | { top?: number; right?: number; bottom?: number; left?: number } => {
  if (typeof margin === 'string') return parseLengthToPt(margin)
  return {
    top: margin.top ? parseLengthToPt(margin.top) : undefined,
    right: margin.right ? parseLengthToPt(margin.right) : undefined,
    bottom: margin.bottom ? parseLengthToPt(margin.bottom) : undefined,
    left: margin.left ? parseLengthToPt(margin.left) : undefined,
  }
}

/** Build the jasy size prop from a PdfPageConfig format string. */
export const resolveJasySize = (format: string, orientation?: 'portrait' | 'landscape'): string => {
  // jasy accepts standard page size names; append orientation separately via Page prop
  // Map common CSS/paged.js names to jasy names
  const map: Record<string, string> = {
    A0: 'A0', A1: 'A1', A2: 'A2', A3: 'A3', A4: 'A4', A5: 'A5', A6: 'A6',
    letter: 'letter', Letter: 'letter',
    legal: 'legal', Legal: 'legal',
    tabloid: 'tabloid', Tabloid: 'tabloid',
  }
  return map[format] ?? format
}

/**
 * Split a header/footer template string on {{ page }} and {{ totalPages }} tokens,
 * returning an array of plain Text and PageNumber/PageCount jasy nodes.
 */
const buildPageTemplate = (template: string, style: Record<string, unknown> = {}): JasyNode[] => {
  const result: JasyNode[] = []
  const re = /\{\{\s*(\w+)\s*\}\}/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(template)) !== null) {
    if (match.index > last) {
      result.push(Text(template.slice(last, match.index), { size: 9, ...style }))
    }
    const token = match[1]
    if (token === 'page') result.push(PageNumber({ size: 9, ...style }))
    else if (token === 'totalPages') result.push(PageCount({ size: 9, ...style }))
    else result.push(Text(`{{ ${token} }}`, { size: 9, ...style }))
    last = match.index + match[0].length
  }

  const remaining = template.slice(last)
  if (remaining) result.push(Text(remaining, { size: 9, ...style }))
  return result
}

/**
 * Build a jasy header element from PdfPageConfig header keys.
 * Returns undefined when no header is configured.
 */
const buildHeader = (pdf: PdfPageConfig): JasyNode | undefined => {
  const { header, headerLeft, headerRight } = pdf
  if (!header && !headerLeft && !headerRight) return undefined

  const left = headerLeft ? buildPageTemplate(headerLeft) : [Text('')]
  const center = header ? buildPageTemplate(header) : []
  const right = headerRight ? buildPageTemplate(headerRight) : [Text('')]

  if (header && !headerLeft && !headerRight) {
    return Row({ justify: 'center' }, buildPageTemplate(header))
  }

  return Row({ justify: 'between' }, [
    Row({}, left),
    ...(center.length > 0 ? [Row({}, center)] : []),
    Row({}, right),
  ])
}

/**
 * Build a jasy footer element from PdfPageConfig footer keys.
 * Returns undefined when no footer is configured.
 */
const buildFooter = (pdf: PdfPageConfig): JasyNode | undefined => {
  const { footer, footerLeft, footerRight } = pdf
  if (!footer && !footerLeft && !footerRight) return undefined

  const left = footerLeft ? buildPageTemplate(footerLeft) : [Text('')]
  const center = footer ? buildPageTemplate(footer) : []
  const right = footerRight ? buildPageTemplate(footerRight) : [Text('')]

  if (footer && !footerLeft && !footerRight) {
    return Row({ justify: 'center' }, buildPageTemplate(footer))
  }

  return Row({ justify: 'between' }, [
    Row({}, left),
    ...(center.length > 0 ? [Row({}, center)] : []),
    Row({}, right),
  ])
}

export interface JasyPageProps {
  size: string
  orientation?: 'portrait' | 'landscape'
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
  header?: JasyNode
  footer?: JasyNode
}

/**
 * Convert a PdfPageConfig to jasy Page props.
 */
export const pdfConfigToPageProps = (pdf: PdfPageConfig = {}): JasyPageProps => {
  const { format = 'A4', orientation, margin } = pdf
  return {
    size: resolveJasySize(format, orientation),
    orientation,
    margin: margin ? resolveJasyMargin(margin) : undefined,
    header: buildHeader(pdf),
    footer: buildFooter(pdf),
  }
}
