import { describe, expect, it } from 'vitest'
import { HTML_VOID_ELEMENTS, isHtmlVoidElement } from '../src/utils/index.ts'

describe('isHtmlVoidElement', () => {
  it('matches the HTML void element set, case-insensitively', () => {
    expect(isHtmlVoidElement('br')).toBe(true)
    expect(isHtmlVoidElement('IMG')).toBe(true)
    expect(isHtmlVoidElement('Wbr')).toBe(true)
    expect(HTML_VOID_ELEMENTS.has('br')).toBe(true)
  })

  it('rejects elements that can have children', () => {
    expect(isHtmlVoidElement('div')).toBe(false)
    expect(isHtmlVoidElement('p')).toBe(false)
    expect(isHtmlVoidElement('span')).toBe(false)
    expect(isHtmlVoidElement('')).toBe(false)
  })
})
