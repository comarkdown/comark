import { describe, expect, it } from 'vitest'
import {
  parseLengthToPt,
  pdfConfigToDocumentOptions,
  pdfConfigToPageProps,
  pdfConfigToRenderOptions,
  resolveContentGap,
  resolveJasyMargin,
} from '../src/page.ts'

describe('parseLengthToPt', () => {
  it('parses mm, cm, in, and bare pt', () => {
    expect(parseLengthToPt('25.4mm')).toBeCloseTo(72, 5)
    expect(parseLengthToPt('1in')).toBe(72)
    expect(parseLengthToPt(48)).toBe(48)
    expect(parseLengthToPt('12')).toBe(12)
  })
})

describe('resolveJasyMargin', () => {
  it('accepts a number as points', () => {
    expect(resolveJasyMargin(0)).toBe(0)
    expect(resolveJasyMargin(48)).toBe(48)
  })

  it('accepts per-side objects with mixed units', () => {
    expect(resolveJasyMargin({ top: '10mm', bottom: 20 })).toEqual({
      top: expect.any(Number),
      right: undefined,
      bottom: 20,
      left: undefined,
    })
  })
})

describe('pdfConfigToPageProps', () => {
  it('maps orientation, justify, and align for certificate-style pages', () => {
    const props = pdfConfigToPageProps({
      format: 'A4',
      orientation: 'landscape',
      margin: 46,
      justify: 'center',
      align: 'center',
    })
    expect(props.size).toBe('A4')
    expect(props.orientation).toBe('landscape')
    expect(props.margin).toBe(46)
    expect(props.justify).toBe('center')
    expect(props.align).toBe('center')
  })

  it('prefers custom width/height over format', () => {
    const props = pdfConfigToPageProps({
      format: 'A4',
      width: '50mm',
      height: '65mm',
    })
    expect(props.size).toMatchObject({ unit: 'pt' })
    expect((props.size as { width: number }).width).toBeCloseTo(50 * (72 / 25.4), 5)
  })
})

describe('pdfConfigToDocumentOptions', () => {
  it('returns undefined when no document fields are set', () => {
    expect(pdfConfigToDocumentOptions({ format: 'A4' })).toBeUndefined()
  })

  it('maps text defaults and meta', () => {
    expect(pdfConfigToDocumentOptions({
      font: 'Times-Roman',
      fontSize: 11,
      color: '#1b2433',
      lineHeight: 1.5,
      textAlign: 'left',
      title: 'Letter',
      author: 'Muster Studio',
    })).toEqual({
      font: 'Times-Roman',
      size: 11,
      color: '#1b2433',
      lineHeight: 1.5,
      align: 'left',
      bold: undefined,
      italic: undefined,
      meta: { title: 'Letter', author: 'Muster Studio' },
    })
  })
})

describe('pdfConfigToRenderOptions', () => {
  it('maps accessibility and encrypt options', () => {
    expect(pdfConfigToRenderOptions({
      title: 'Handbook',
      lang: 'de-DE',
      accessible: true,
      onOverflow: 'warn',
      encrypt: { userPassword: 'secret' },
    })).toEqual({
      title: 'Handbook',
      lang: 'de-DE',
      accessible: true,
      onOverflow: 'warn',
      encrypt: { userPassword: 'secret' },
      fonts: undefined,
    })
  })

  it('includes fonts from the renderer', () => {
    const fonts = { Script: new Uint8Array([1, 2, 3]) }
    expect(pdfConfigToRenderOptions({}, fonts)?.fonts).toBe(fonts)
  })
})

describe('resolveContentGap', () => {
  it('defaults to 10 and accepts 0', () => {
    expect(resolveContentGap()).toBe(10)
    expect(resolveContentGap({ gap: 0 })).toBe(0)
    expect(resolveContentGap({ gap: '12pt' })).toBe(12)
  })
})
