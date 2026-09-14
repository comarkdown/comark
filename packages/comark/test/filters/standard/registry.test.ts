import { describe, expect, it } from 'vitest'
import {
  standardFilters,
  resolveFilterRegistry,
  applyBindingFilters,
  parseBindingExpression,
} from '../../../src/utils/filters/index.ts'
import { resolveAttributes } from '../../../src/internal/stringify/attributes.ts'
import type { NodeRenderData } from '../../../src/types.ts'

describe('standardFilters', () => {
  it('exports an object with filter functions for all categories', () => {
    // Text
    expect(typeof standardFilters.upper).toBe('function')
    expect(typeof standardFilters.lower).toBe('function')
    expect(typeof standardFilters.trim).toBe('function')
    expect(typeof standardFilters.truncate).toBe('function')
    expect(typeof standardFilters.title).toBe('function')
    // Numbers
    expect(typeof standardFilters.calc).toBe('function')
    expect(typeof standardFilters.number_format).toBe('function')
    expect(typeof standardFilters.round).toBe('function')
    // Dates
    expect(typeof standardFilters.date).toBe('function')
    expect(typeof standardFilters.date_modify).toBe('function')
    expect(typeof standardFilters.duration).toBe('function')
    // Collections
    expect(typeof standardFilters.join).toBe('function')
    expect(typeof standardFilters.map).toBe('function')
    expect(typeof standardFilters.sort).toBe('function')
    // Formatting
    expect(typeof standardFilters.bold).toBe('function')
    expect(typeof standardFilters.h1).toBe('function')
    // HTML cleanup
    expect(typeof standardFilters.strip_tags).toBe('function')
  })

  it('does NOT include opt-in HTML parsing filters', () => {
    expect(standardFilters.html_to_json).toBeUndefined()
    expect(standardFilters.remove_html).toBeUndefined()
  })
})

describe('resolveFilterRegistry', () => {
  it('returns standardFilters when no user filters provided', () => {
    expect(resolveFilterRegistry()).toBe(standardFilters)
  })

  it('returns standardFilters when user filters object is empty', () => {
    expect(resolveFilterRegistry({})).toBe(standardFilters)
  })

  it('merges user filters over standard filters', () => {
    const custom = { shout: (v: unknown) => `${String(v)}!!!` }
    const merged = resolveFilterRegistry(custom)
    expect(merged.shout).toBe(custom.shout)
    expect(merged.upper).toBe(standardFilters.upper)
  })

  it('allows a user filter to override a built-in by the same name', () => {
    const override = { upper: (v: unknown) => `<<${String(v)}>>` }
    const merged = resolveFilterRegistry(override)
    expect(merged.upper).toBe(override.upper)
  })

  it('does not mutate standardFilters when merging', () => {
    const before = { ...standardFilters }
    resolveFilterRegistry({ shout: (v: unknown) => String(v) })
    expect(Object.keys(standardFilters)).toEqual(Object.keys(before))
  })
})

const makeRenderData = (overrides: Partial<NodeRenderData> = {}): NodeRenderData => ({
  frontmatter: {},
  meta: {},
  data: {},
  props: {},
  ...overrides,
})

describe('default registry — built-ins available without explicit registration', () => {
  it('applies upper without explicit filters via applyBindingFilters + standardFilters', () => {
    const { filters } = parseBindingExpression('name | upper')
    const result = applyBindingFilters('ada', filters, standardFilters)
    expect(result).toBe('ADA')
  })

  it('resolves a built-in filter via resolveAttributes with standardFilters as the registry', () => {
    const result = resolveAttributes(
      { ':title': 'frontmatter.name | upper' },
      makeRenderData({ frontmatter: { name: 'ada' } }),
      { filters: standardFilters }
    )
    expect(result).toEqual({ title: 'ADA' })
  })

  it('resolves a chained built-in pipeline via resolveAttributes', () => {
    const result = resolveAttributes(
      { ':label': 'frontmatter.bio | upper | truncate:5' },
      makeRenderData({ frontmatter: { bio: 'hello world' } }),
      { filters: standardFilters }
    )
    // 'hello world' → upper → 'HELLO WORLD' (11 chars) → truncate:5 → 'HELL…' (4 + ellipsis = 5)
    expect(result).toEqual({ label: 'HELL…' })
  })

  it('allows a custom filter to override a built-in of the same name', () => {
    const merged = resolveFilterRegistry({ upper: () => 'overridden' })
    const result = resolveAttributes(
      { ':x': 'frontmatter.v | upper' },
      makeRenderData({ frontmatter: { v: 'anything' } }),
      { filters: merged }
    )
    expect(result).toEqual({ x: 'overridden' })
  })
})
