import { Row, Text, PageNumber, PageCount } from '@jasy/pdf'
import type { PdfMargin, PdfPageConfig, PdfRendererOptions } from './types.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JasyNode = any

/** Convert a CSS length string or bare points number to PDF points. */
export const parseLengthToPt = (val: string | number): number => {
  if (typeof val === 'number') return val
  const n = parseFloat(val)
  if (val.endsWith('mm')) return n * (72 / 25.4)
  if (val.endsWith('cm')) return n * (720 / 25.4)
  if (val.endsWith('in')) return n * 72
  return n // assume pt
}

/** Resolve a PdfMargin to a value accepted by jasy (number or per-side object). */
export const resolveJasyMargin = (
  margin: string | number | PdfMargin,
): number | { top?: number; right?: number; bottom?: number; left?: number } => {
  if (typeof margin === 'string' || typeof margin === 'number') return parseLengthToPt(margin)
  return {
    top: margin.top !== undefined ? parseLengthToPt(margin.top) : undefined,
    right: margin.right !== undefined ? parseLengthToPt(margin.right) : undefined,
    bottom: margin.bottom !== undefined ? parseLengthToPt(margin.bottom) : undefined,
    left: margin.left !== undefined ? parseLengthToPt(margin.left) : undefined,
  }
}

export type JasySize = string | { width: number; height: number; unit?: 'pt' | 'mm' }

/** Build the jasy size prop from a PdfPageConfig format string. */
export const resolveJasySize = (format: string, _orientation?: 'portrait' | 'landscape'): string => {
  const map: Record<string, string> = {
    A0: 'A0', A1: 'A1', A2: 'A2', A3: 'A3', A4: 'A4', A5: 'A5', A6: 'A6',
    letter: 'letter', Letter: 'letter',
    legal: 'legal', Legal: 'legal',
    tabloid: 'tabloid', Tabloid: 'tabloid',
  }
  return map[format] ?? format
}

/** Resolve custom width/height CSS lengths to a jasy CustomSize in points. */
export const resolveJasyCustomSize = (width: string, height: string): JasySize => ({
  width: parseLengthToPt(width),
  height: parseLengthToPt(height),
  unit: 'pt',
})

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
  size: JasySize
  orientation?: 'portrait' | 'landscape'
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
  justify?: PdfPageConfig['justify']
  align?: PdfPageConfig['align']
  header?: JasyNode
  footer?: JasyNode
}

/** jasy `Document(...)` options derived from PdfPageConfig. */
export interface JasyDocumentOptions {
  font?: string | string[]
  size?: number
  color?: string
  lineHeight?: number
  align?: PdfPageConfig['textAlign']
  bold?: boolean
  italic?: boolean
  meta?: { title?: string; author?: string }
}

/** Subset of jasy `RenderOptions` derived from PdfPageConfig (+ fonts from renderer options). */
export interface JasyRenderOptions {
  title?: string
  lang?: string
  accessible?: boolean
  onOverflow?: PdfPageConfig['onOverflow']
  encrypt?: PdfPageConfig['encrypt']
  fonts?: PdfRendererOptions['fonts']
}

const hasDocumentOptions = (pdf: PdfPageConfig): boolean =>
  pdf.font !== undefined
  || pdf.fontSize !== undefined
  || pdf.color !== undefined
  || pdf.lineHeight !== undefined
  || pdf.textAlign !== undefined
  || pdf.bold !== undefined
  || pdf.italic !== undefined
  || pdf.title !== undefined
  || pdf.author !== undefined

/**
 * Convert a PdfPageConfig to jasy Page props.
 *
 * Note: `gap` is applied to the content Column in `renderPdfDocument`, not here —
 * jasy `Page` auto-wraps multiple children, while Comark always supplies one Column.
 */
export const pdfConfigToPageProps = (pdf: PdfPageConfig = {}): JasyPageProps => {
  const { format = 'A4', width, height, orientation, margin, justify, align } = pdf
  const size =
    width && height
      ? resolveJasyCustomSize(width, height)
      : resolveJasySize(format, orientation)
  return {
    size,
    orientation,
    margin: margin !== undefined ? resolveJasyMargin(margin) : undefined,
    justify,
    align,
    header: buildHeader(pdf),
    footer: buildFooter(pdf),
  }
}

/**
 * Convert PdfPageConfig text defaults + metadata to jasy Document options.
 * Returns `undefined` when nothing document-level is configured.
 */
export const pdfConfigToDocumentOptions = (pdf: PdfPageConfig = {}): JasyDocumentOptions | undefined => {
  if (!hasDocumentOptions(pdf)) return undefined

  const meta =
    pdf.title !== undefined || pdf.author !== undefined
      ? { title: pdf.title, author: pdf.author }
      : undefined

  return {
    font: pdf.font,
    size: pdf.fontSize,
    color: pdf.color,
    lineHeight: pdf.lineHeight,
    align: pdf.textAlign,
    bold: pdf.bold,
    italic: pdf.italic,
    meta,
  }
}

/**
 * Convert PdfPageConfig (+ optional fonts) to jasy renderToBytes options.
 * Returns `undefined` when nothing render-level is configured.
 */
export const pdfConfigToRenderOptions = (
  pdf: PdfPageConfig = {},
  fonts?: JasyRenderOptions['fonts'],
): JasyRenderOptions | undefined => {
  const hasRender =
    pdf.title !== undefined
    || pdf.lang !== undefined
    || pdf.accessible !== undefined
    || pdf.onOverflow !== undefined
    || pdf.encrypt !== undefined
    || fonts !== undefined

  if (!hasRender) return undefined

  return {
    title: pdf.title,
    lang: pdf.lang,
    accessible: pdf.accessible,
    onOverflow: pdf.onOverflow,
    encrypt: pdf.encrypt,
    fonts,
  }
}

/** Content column gap in points (default 10). */
export const resolveContentGap = (pdf: PdfPageConfig = {}): number =>
  pdf.gap !== undefined ? parseLengthToPt(pdf.gap) : 10
