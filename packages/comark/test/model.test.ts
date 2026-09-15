import { afterEach, describe, expect, it, vi } from 'vitest'
import { createModelStore } from '../src/model.ts'
import type { ComarkModel } from '../src/model.ts'

// Ensure globalThis.comarkContext is clean between tests.
afterEach(() => {
  globalThis.comarkContext = undefined
})

describe('createModelStore', () => {
  it('returns undefined for unknown paths', () => {
    const model = createModelStore()
    expect(model.get('data.x')).toBeUndefined()
  })

  it('reads initial data', () => {
    const model = createModelStore({ data: { data: { name: 'Alice' } } })
    expect(model.get('data.name')).toBe('Alice')
  })

  it('writes and reads back', () => {
    const model = createModelStore({ data: { data: {} } })
    const ok = model.set('data.count', 42)
    expect(ok).toBe(true)
    expect(model.get('data.count')).toBe(42)
  })

  it('rejects writes outside writable namespaces', () => {
    const model = createModelStore({ data: { frontmatter: { title: 'hi' } } })
    const ok = model.set('frontmatter.title', 'changed')
    expect(ok).toBe(false)
    expect(model.get('frontmatter.title')).toBe('hi')
  })

  it('accepts writes to custom writable namespaces', () => {
    const model = createModelStore({
      data: { state: { open: false } },
      writable: ['state'],
    })
    expect(model.set('state.open', true)).toBe(true)
    expect(model.get('state.open')).toBe(true)
  })

  it('rejects prototype-pollution paths', () => {
    const model = createModelStore()
    expect(model.set('__proto__.evil', 1)).toBe(false)
    expect(model.set('constructor.prototype.evil', 1)).toBe(false)
    expect(model.set('data..bad', 1)).toBe(false)
    const plain: Record<string, unknown> = {}
    expect((plain as any).evil).toBeUndefined()
  })

  describe('subscribe fan-out', () => {
    it('notifies exact path subscriber', () => {
      const model = createModelStore({ data: { data: { a: { b: 1 } } } })
      const fn = vi.fn()
      model.subscribe('data.a.b', fn)
      model.set('data.a.b', 2)
      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenCalledWith(2)
    })

    it('notifies ancestor path subscribers', () => {
      const model = createModelStore({ data: { data: { a: { b: 1 } } } })
      const fnParent = vi.fn()
      const fnRoot = vi.fn()
      model.subscribe('data.a', fnParent)
      model.subscribe('data', fnRoot)
      model.set('data.a.b', 2)
      expect(fnParent).toHaveBeenCalledOnce()
      expect(fnRoot).toHaveBeenCalledOnce()
    })

    it('does NOT notify unrelated path subscribers', () => {
      const model = createModelStore({ data: { data: { x: 1, y: 1 } } })
      const fn = vi.fn()
      model.subscribe('data.y', fn)
      model.set('data.x', 99)
      expect(fn).not.toHaveBeenCalled()
    })

    it('teardown removes the listener', () => {
      const model = createModelStore({ data: { data: {} } })
      const fn = vi.fn()
      const unsub = model.subscribe('data.k', fn)
      unsub()
      model.set('data.k', 1)
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('batch', () => {
    it('coalesces multiple writes into one notification pass', () => {
      const model = createModelStore({ data: { data: {} } })
      const fn = vi.fn()
      model.subscribe('data', fn)
      model.batch!(() => {
        model.set('data.a', 1)
        model.set('data.b', 2)
      })
      // One notification per subscribed path, flushed after batch.
      expect(fn).toHaveBeenCalledOnce()
    })
  })

  describe('onChange callback', () => {
    it('fires after an accepted write', () => {
      const onChange = vi.fn()
      const model = createModelStore({ data: { data: {} }, onChange })
      model.set('data.x', 7)
      expect(onChange).toHaveBeenCalledWith('data.x', 7, expect.objectContaining({ data: { x: 7 } }))
    })

    it('does not fire when write is rejected', () => {
      const onChange = vi.fn()
      const model = createModelStore({ onChange })
      model.set('frontmatter.x', 1)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('per-instance isolation', () => {
    it('does not mutate the caller-supplied data object', () => {
      const initial = { data: { name: 'Alice' } }
      const model = createModelStore({ data: initial })
      model.set('data.name', 'Bob')
      expect(initial.data.name).toBe('Alice')
      expect(model.get('data.name')).toBe('Bob')
    })

    it('two stores share no state', () => {
      const a = createModelStore({ data: { data: {} } })
      const b = createModelStore({ data: { data: {} } })
      a.set('data.x', 1)
      expect(b.get('data.x')).toBeUndefined()
    })

    it('subscriber on store A is not called when store B writes', () => {
      const a = createModelStore({ data: { data: {} } })
      const b = createModelStore({ data: { data: {} } })
      const fn = vi.fn()
      a.subscribe('data.x', fn)
      b.set('data.x', 99)
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('documentKey bridge', () => {
    it('emits { op: data } into globalThis.comarkContext when documentKey is set', () => {
      const patchSpy = vi.fn()
      globalThis.comarkContext = { get: () => ({ patch: patchSpy }) } as any

      const model = createModelStore({ data: { data: {} }, documentKey: 'doc1' })
      model.set('data.name', 'Bob')

      expect(patchSpy).toHaveBeenCalledWith({ op: 'data', data: { name: 'Bob' } })
    })

    it('does not emit when documentKey is absent', () => {
      const patchSpy = vi.fn()
      globalThis.comarkContext = { get: () => ({ patch: patchSpy }) } as any

      const model = createModelStore({ data: { data: {} } })
      model.set('data.name', 'Bob')

      expect(patchSpy).not.toHaveBeenCalled()
    })
  })

  it('satisfies the ComarkModel interface', () => {
    const model: ComarkModel = createModelStore()
    expect(typeof model.get).toBe('function')
    expect(typeof model.set).toBe('function')
    expect(typeof model.subscribe).toBe('function')
    expect(typeof model.batch).toBe('function')
  })
})
