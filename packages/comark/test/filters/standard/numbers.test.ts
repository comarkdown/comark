import { describe, expect, it } from 'vitest'
import { numbersFilters } from '../../../src/utils/filters/numbers.ts'

describe('numbersFilters', () => {
  describe('calc', () => {
    it('adds by default', () => expect(numbersFilters.calc(10, '+', 5)).toBe(15))
    it('subtracts', () => expect(numbersFilters.calc(10, '-', 3)).toBe(7))
    it('multiplies', () => expect(numbersFilters.calc(4, '*', 3)).toBe(12))
    it('divides', () => expect(numbersFilters.calc(10, '/', 4)).toBe(2.5))
    it('returns NaN for divide by zero', () => expect(numbersFilters.calc(5, '/', 0)).toBeNaN())
    it('computes modulo', () => expect(numbersFilters.calc(10, '%', 3)).toBe(1))
    it('returns NaN for modulo by zero', () => expect(numbersFilters.calc(5, '%', 0)).toBeNaN())
    it('raises to power with ^', () => expect(numbersFilters.calc(2, '^', 10)).toBe(1024))
    it('raises to power with **', () => expect(numbersFilters.calc(2, '**', 8)).toBe(256))
    it('coerces string operand', () => expect(numbersFilters.calc('5', '+', '3')).toBe(8))
    it('returns value unchanged for unknown operator', () => expect(numbersFilters.calc(7, '?', 3)).toBe(7))
    it('coerces null to 0', () => expect(numbersFilters.calc(null, '+', 5)).toBe(5))
  })

  describe('number_format', () => {
    it('formats integer with thousands separator', () => {
      expect(numbersFilters.number_format(1234567)).toBe('1,234,567')
    })
    it('formats with custom decimal places', () => {
      expect(numbersFilters.number_format(1234.5, 2)).toBe('1,234.50')
    })
    it('supports custom separators', () => {
      expect(numbersFilters.number_format(1234.5, 2, ',', '.')).toBe('1.234,50')
    })
    it('formats negative numbers correctly', () => {
      expect(numbersFilters.number_format(-9876.5, 2)).toBe('-9,876.50')
    })
    it('coerces string input', () => {
      expect(numbersFilters.number_format('1000')).toBe('1,000')
    })
    it('coerces null to 0', () => {
      expect(numbersFilters.number_format(null)).toBe('0')
    })
  })

  describe('round', () => {
    it('rounds to integer by default', () => expect(numbersFilters.round(4.6)).toBe(5))
    it('rounds to specified decimal places', () => expect(numbersFilters.round(4.567, 2)).toBe(4.57))
    it('rounds negative numbers', () => expect(numbersFilters.round(-4.5)).toBe(-4))
    it('coerces string input', () => expect(numbersFilters.round('3.7')).toBe(4))
    it('coerces null to 0', () => expect(numbersFilters.round(null)).toBe(0))
  })
})
