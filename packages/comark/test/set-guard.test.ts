import { describe, expect, it } from 'vitest'
import { set } from '../src/utils/index.ts'

describe('set()', () => {
  it('sets a top-level key', () => {
    const obj: Record<string, unknown> = {}
    expect(set(obj, 'x', 1)).toBe(true)
    expect(obj.x).toBe(1)
  })

  it('sets a nested key, creating intermediate objects', () => {
    const obj: Record<string, unknown> = {}
    expect(set(obj, 'a.b.c', 42)).toBe(true)
    expect((obj as any).a.b.c).toBe(42)
  })

  it('overwrites an existing nested value', () => {
    const obj = { data: { name: 'Alice' } }
    set(obj, 'data.name', 'Bob')
    expect(obj.data.name).toBe('Bob')
  })

  it('returns false for __proto__', () => {
    const obj: Record<string, unknown> = {}
    expect(set(obj, '__proto__.evil', 1)).toBe(false)
    expect(({} as any).evil).toBeUndefined()
  })

  it('returns false for constructor', () => {
    const obj: Record<string, unknown> = {}
    expect(set(obj, 'constructor.prototype.evil', 1)).toBe(false)
  })

  it('returns false for prototype', () => {
    const obj: Record<string, unknown> = {}
    expect(set(obj, 'prototype.evil', 1)).toBe(false)
  })

  it('returns false for an empty path segment', () => {
    const obj: Record<string, unknown> = {}
    expect(set(obj, 'a..b', 1)).toBe(false)
    expect(set(obj, '.x', 1)).toBe(false)
    expect(set(obj, 'x.', 1)).toBe(false)
  })

  it('returns false when an intermediate node is not an object', () => {
    const obj = { data: { count: 5 } }
    expect(set(obj, 'data.count.nested', 1)).toBe(false)
  })

  it('returns false when the root is not an object', () => {
    expect(set(null, 'x', 1)).toBe(false)
    expect(set('string', 'x', 1)).toBe(false)
    expect(set(42, 'x', 1)).toBe(false)
  })

  it('does not affect Object.prototype after prototype-pollution attempt', () => {
    set({}, '__proto__.polluted', true)
    set({}, 'constructor.prototype.polluted', true)
    expect(({} as any).polluted).toBeUndefined()
  })
})
