import { describe, expect, it } from 'vitest'
import { isSpaceCode } from '../src/utils/index.ts'

describe('isSpaceCode', () => {
  it('matches space, tab, line feed and carriage return', () => {
    for (const ch of [' ', '\t', '\n', '\r']) {
      expect(isSpaceCode(ch.charCodeAt(0))).toBe(true)
    }
  })

  it('rejects other characters', () => {
    for (const ch of ['a', '0', '\f', '\v', '\u00a0', '\u3000']) {
      expect(isSpaceCode(ch.charCodeAt(0))).toBe(false)
    }
    expect(isSpaceCode(Number.NaN)).toBe(false)
  })
})
