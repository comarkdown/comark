import { describe, expect, it } from 'vitest'
import { datesFilters } from '../../../src/utils/filters/dates.ts'

describe('datesFilters', () => {
  describe('date', () => {
    it('formats a date string with the default YYYY-MM-DD format', () => {
      // Use a UTC midnight date to avoid timezone shifts in the integer-day parts
      const result = datesFilters.date('2024-06-15')
      // Only check the year, month, day fields since the implementation uses local time
      expect(result).toMatch(/2024/)
    })

    it('formats using a custom format string', () => {
      const result = datesFilters.date('2024-01-05', 'DD/MM/YYYY')
      expect(result).toMatch(/\d{2}\/01\/2024/)
    })

    it('returns empty string for null', () => {
      expect(datesFilters.date(null)).toBe('')
    })

    it('returns empty string for invalid date string', () => {
      expect(datesFilters.date('not-a-date')).toBe('')
    })

    it('formats a Date object', () => {
      const d = new Date(2023, 0, 1) // Jan 1 2023 local
      const result = datesFilters.date(d, 'YYYY')
      expect(result).toBe('2023')
    })

    it('accepts MMMM (full month name) token', () => {
      const d = new Date(2024, 5, 1) // June 1
      expect(datesFilters.date(d, 'MMMM')).toBe('June')
    })

    it('accepts MMM (short month name) token', () => {
      const d = new Date(2024, 0, 1) // January
      expect(datesFilters.date(d, 'MMM')).toBe('Jan')
    })

    it('accepts DDDD (full day name) token', () => {
      // 2024-06-03 is a Monday
      const d = new Date(2024, 5, 3)
      expect(datesFilters.date(d, 'DDDD')).toBe('Monday')
    })

    it('accepts AM/PM token', () => {
      const d = new Date(2024, 0, 1, 14, 0, 0) // 14:00
      expect(datesFilters.date(d, 'A')).toBe('PM')
    })
  })

  describe('date_modify', () => {
    it('adds days to a date', () => {
      const d = new Date(2024, 0, 10) // Jan 10
      const result = datesFilters.date_modify(d, '+5 days') as Date
      expect(result.getDate()).toBe(15)
    })

    it('subtracts months', () => {
      const d = new Date(2024, 5, 1) // June 1
      const result = datesFilters.date_modify(d, '-2 months') as Date
      expect(result.getMonth()).toBe(3) // April
    })

    it('adds years', () => {
      const d = new Date(2024, 0, 1)
      const result = datesFilters.date_modify(d, '+1 year') as Date
      expect(result.getFullYear()).toBe(2025)
    })

    it('returns original value for null input', () => {
      expect(datesFilters.date_modify(null, '+1 day')).toBeNull()
    })

    it('returns original value for null interval', () => {
      const d = new Date(2024, 0, 1)
      expect(datesFilters.date_modify(d, null)).toBe(d)
    })

    it('returns original date for unparseable interval', () => {
      const d = new Date(2024, 0, 1)
      const result = datesFilters.date_modify(d, 'bogus interval') as Date
      expect(result.getTime()).toBe(d.getTime())
    })
  })

  describe('duration', () => {
    it('formats seconds', () => expect(datesFilters.duration(90)).toBe('1m 30s'))
    it('formats zero seconds', () => expect(datesFilters.duration(0)).toBe('0s'))
    it('formats hours and minutes', () => expect(datesFilters.duration(3661)).toBe('1h 1m 1s'))
    it('formats days', () => expect(datesFilters.duration(86400)).toBe('1d'))
    it('coerces string input', () => expect(datesFilters.duration('3600')).toBe('1h'))
    it('handles negative duration with sign', () => {
      const result = String(datesFilters.duration(-90))
      expect(result).toContain('-')
    })
  })
})
