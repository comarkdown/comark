import { describe, expect, it } from 'vitest'
import { parseBindingExpression, applyBindingFilters } from '../src/utils/filters.ts'
import type { BindingFilters } from '../src/utils/filters.ts'

// ---------------------------------------------------------------------------
// parseBindingExpression
// ---------------------------------------------------------------------------

describe('parseBindingExpression', () => {
  it('fast-paths when no pipe is present', () => {
    expect(parseBindingExpression('user.name')).toEqual({ path: 'user.name', filters: [] })
  })

  it('trims the path', () => {
    expect(parseBindingExpression('  user.name  ')).toEqual({ path: 'user.name', filters: [] })
  })

  it('parses a single filter with no args', () => {
    expect(parseBindingExpression('title | upper')).toEqual({
      path: 'title',
      filters: [{ name: 'upper', args: [] }],
    })
  })

  it('parses a chain of filters', () => {
    expect(parseBindingExpression('title | upper | truncate')).toEqual({
      path: 'title',
      filters: [
        { name: 'upper', args: [] },
        { name: 'truncate', args: [] },
      ],
    })
  })

  it('parses a numeric filter argument', () => {
    expect(parseBindingExpression('title | truncate:10')).toEqual({
      path: 'title',
      filters: [{ name: 'truncate', args: [10] }],
    })
  })

  it('parses a boolean filter argument', () => {
    expect(parseBindingExpression('x | wrap:true')).toEqual({
      path: 'x',
      filters: [{ name: 'wrap', args: [true] }],
    })
  })

  it('parses a quoted string argument with inner colons', () => {
    expect(parseBindingExpression("date | format:'YYYY-MM-DD HH:mm'")).toEqual({
      path: 'date',
      filters: [{ name: 'format', args: ['YYYY-MM-DD HH:mm'] }],
    })
  })

  it('parses multiple colon-delimited arguments', () => {
    expect(parseBindingExpression('x | clamp:0:100')).toEqual({
      path: 'x',
      filters: [{ name: 'clamp', args: [0, 100] }],
    })
  })

  it('parses a chained filter with args after a plain filter', () => {
    expect(parseBindingExpression('bio | trim | truncate:200 | upper')).toEqual({
      path: 'bio',
      filters: [
        { name: 'trim', args: [] },
        { name: 'truncate', args: [200] },
        { name: 'upper', args: [] },
      ],
    })
  })

  it('treats || as a non-splitting pair (default-value guard)', () => {
    // The binding parser strips || before storing :value, but we guard anyway.
    const result = parseBindingExpression('a || b')
    // Should not split on || — result has no filters
    expect(result.filters).toHaveLength(0)
    expect(result.path).toContain('||')
  })

  it('handles a double-quoted string argument', () => {
    expect(parseBindingExpression('x | default:"n/a"')).toEqual({
      path: 'x',
      filters: [{ name: 'default', args: ['n/a'] }],
    })
  })
})

// ---------------------------------------------------------------------------
// applyBindingFilters
// ---------------------------------------------------------------------------

describe('applyBindingFilters', () => {
  it('returns the value unchanged when the filter list is empty', () => {
    const registry: BindingFilters = {}
    expect(applyBindingFilters('hello', [], registry)).toBe('hello')
  })

  it('applies a single filter', () => {
    const registry: BindingFilters = {
      upper: (v: unknown) => (v as string).toUpperCase(),
    }
    expect(applyBindingFilters('hello', [{ name: 'upper', args: [] }], registry)).toBe('HELLO')
  })

  it('applies filters sequentially (output of one feeds next)', () => {
    const registry: BindingFilters = {
      upper: (v: unknown) => (v as string).toUpperCase(),
      truncate: (v: unknown, len: unknown) => (v as string).slice(0, len as number),
    }
    expect(
      applyBindingFilters('hello world', [
        { name: 'upper', args: [] },
        { name: 'truncate', args: [5] },
      ], registry)
    ).toBe('HELLO')
  })

  it('passes arguments to the filter function', () => {
    const registry: BindingFilters = {
      repeat: (v: unknown, n: unknown) => (v as string).repeat(n as number),
    }
    expect(applyBindingFilters('ab', [{ name: 'repeat', args: [3] }], registry)).toBe('ababab')
  })

  it('throws on an unknown filter name', () => {
    expect(() =>
      applyBindingFilters('value', [{ name: 'nope', args: [] }], {})
    ).toThrow('Unknown binding filter: "nope"')
  })
})

// ---------------------------------------------------------------------------
// Integration: parseBindingExpression + applyBindingFilters
// ---------------------------------------------------------------------------

describe('pipe filter integration', () => {
  const registry: BindingFilters = {
    upper: (v: unknown) => (typeof v === 'string' ? v.toUpperCase() : v),
    truncate: (v: unknown, len: unknown) =>
      typeof v === 'string' && v.length > (len as number) ? `${v.slice(0, len as number)}…` : v,
    default: (v: unknown, fallback: unknown) => (v == null ? fallback : v),
  }

  it('resolves a chained expression end-to-end', () => {
    const { path, filters } = parseBindingExpression('bio | upper | truncate:10')
    expect(path).toBe('bio')
    const result = applyBindingFilters('hello world', filters, registry)
    // "hello world" → upper → "HELLO WORLD" (11 chars) → truncate:10 → "HELLO WORL…"
    expect(result).toBe('HELLO WORL…')
  })

  it('uses default filter for null value', () => {
    const { path, filters } = parseBindingExpression('bio | default:"(none)"')
    expect(path).toBe('bio')
    const result = applyBindingFilters(null, filters, registry)
    expect(result).toBe('(none)')
  })
})
