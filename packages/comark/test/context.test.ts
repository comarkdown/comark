import { afterEach, describe, expect, it, vi } from 'vitest'
import { createComarkContext, subscribeComarkDocument } from '../src/context'
import type { ComarkTree } from '../src/types'

function tree(nodes: ComarkTree['nodes']): ComarkTree {
  return { nodes, frontmatter: {}, meta: {} }
}

describe('createComarkContext', () => {
  afterEach(() => {
    globalThis.comarkContext = undefined
  })

  it('installs itself on globalThis by default', () => {
    const ctx = createComarkContext()
    expect(globalThis.comarkContext).toBe(ctx)
  })

  it('does not install when install is false', () => {
    createComarkContext(false)
    expect(globalThis.comarkContext).toBeUndefined()
  })

  it('returns a stable document per id and tracks keys', () => {
    const ctx = createComarkContext(false)
    const a = ctx.get('a')
    expect(ctx.get('a')).toBe(a)
    ctx.get('b')
    expect(ctx.keys().sort()).toEqual(['a', 'b'])
  })

  it('seeds the tree from initial on first access only', () => {
    const ctx = createComarkContext(false)
    const seed = tree([['p', {}, 'seed']])
    expect(ctx.get('x', seed).tree).toBe(seed)
    // later accessors ignore initial and keep the existing tree
    expect(ctx.get('x', tree([['p', {}, 'other']])).tree).toBe(seed)
  })

  it('isolates documents by id', () => {
    const ctx = createComarkContext(false)
    const a = vi.fn()
    const b = vi.fn()
    ctx.get('a').listen(a)
    ctx.get('b').listen(b)
    ctx.get('a').set(tree([['p', {}, 'a']]))
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(0)
  })

  describe('document', () => {
    it('set replaces the tree and notifies listeners', () => {
      const doc = createComarkContext(false).get('x')
      const fn = vi.fn()
      doc.listen(fn)
      const next = tree([['p', {}, 'a']])
      doc.set(next)
      expect(doc.tree).toBe(next)
      expect(fn).toHaveBeenCalledWith(next)
    })

    it('patch applies against the current tree', () => {
      const doc = createComarkContext(false).get('x')
      doc.set(tree([['p', {}, 'old']]))
      doc.patch({ op: 'replace', path: [0], node: ['p', {}, 'new'] })
      expect(doc.tree.nodes[0]).toEqual(['p', {}, 'new'])
    })

    it('applies an array of patches but emits once', () => {
      const doc = createComarkContext(false).get('x')
      const fn = vi.fn()
      doc.set(tree([['p', {}, 'a']]))
      doc.listen(fn)
      doc.patch([
        { op: 'insert', path: [1], node: ['p', {}, 'b'] },
        { op: 'insert', path: [2], node: ['p', {}, 'c'] },
      ])
      expect(fn).toHaveBeenCalledTimes(1)
      expect(doc.tree.nodes).toHaveLength(3)
    })

    it('merges meta and frontmatter', () => {
      const doc = createComarkContext(false).get('x')
      doc.set({ nodes: [], frontmatter: { t: 1 }, meta: { a: 1 } })
      doc.patch([
        { op: 'meta', meta: { b: 2 } },
        { op: 'frontmatter', frontmatter: { u: 2 } },
      ])
      expect(doc.tree.meta).toEqual({ a: 1, b: 2 })
      expect(doc.tree.frontmatter).toEqual({ t: 1, u: 2 })
    })

    it('keeps untouched branches referentially identical', () => {
      const doc = createComarkContext(false).get('x')
      const keep: ComarkTree['nodes'][number] = ['p', {}, 'keep']
      doc.set(tree([keep, ['p', {}, 'old']]))
      doc.patch({ op: 'replace', path: [1], node: ['p', {}, 'new'] })
      expect(doc.tree.nodes[0]).toBe(keep)
    })

    it('throws on an empty path for node ops', () => {
      const doc = createComarkContext(false).get('x')
      doc.set(tree([['p', {}, 'a']]))
      expect(() => doc.patch({ op: 'remove', path: [] })).toThrow(/non-empty path/)
    })

    it('stops notifying after cleanup', () => {
      const doc = createComarkContext(false).get('x')
      const fn = vi.fn()
      const cleanup = doc.listen(fn)
      doc.set(tree([['p', {}, '1']]))
      cleanup()
      doc.set(tree([['p', {}, '2']]))
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('drops the document once its last listener unsubscribes', () => {
      const ctx = createComarkContext(false)
      const c1 = ctx.get('x').listen(vi.fn())
      const c2 = ctx.get('x').listen(vi.fn())
      c1()
      expect(ctx.keys()).toEqual(['x']) // still one listener
      c2()
      expect(ctx.keys()).toEqual([]) // pruned
    })

    it('sticky listeners receive updates and survive cleanup(true), but do not pin the doc', () => {
      const ctx = createComarkContext(false)
      const stickyFn = vi.fn()
      const a = vi.fn()
      const b = vi.fn()
      const ca = ctx.get('x').listen(a)
      ctx.get('x').listen(b)
      const stickyCleanup = ctx.get('x').listen(stickyFn, { sticky: true })

      const next = tree([['p', {}, 'hi']])
      ctx.get('x').set(next)
      expect(stickyFn).toHaveBeenCalledWith(next)
      expect(a).toHaveBeenCalledWith(next)
      expect(b).toHaveBeenCalledWith(next)

      // Force-clear from one renderer wipes every normal listener; sticky alone
      // does not pin the document, so it is pruned.
      ca(true)
      expect(ctx.keys()).toEqual([])

      // Tearing down sticky after prune must not throw or re-emit remove forever.
      expect(() => stickyCleanup()).not.toThrow()
    })

    it('remove lifecycle is emitted once on prune', () => {
      const ctx = createComarkContext(false)
      const life = vi.fn()
      ctx.listen(life)
      const cleanup = ctx.get('x', tree([['p', {}, 'a']])).listen(vi.fn())
      life.mockClear()
      cleanup(true)
      expect(life).toHaveBeenCalledTimes(1)
      expect(life).toHaveBeenCalledWith(expect.objectContaining({ event: 'remove', id: 'x' }))
    })
  })

  describe('ensure', () => {
    it('creates like get on first access', () => {
      const ctx = createComarkContext(false)
      const seed = tree([['p', {}, 'a']])
      expect(ctx.ensure('x', seed).tree).toBe(seed)
      expect(ctx.keys()).toEqual(['x'])
    })

    it('re-seeds an empty document', () => {
      const ctx = createComarkContext(false)
      ctx.ensure('x') // empty
      const seed = tree([['p', {}, 'filled']])
      ctx.ensure('x', seed)
      expect(ctx.get('x').tree).toEqual(seed)
    })

    it('does not overwrite a non-empty document', () => {
      const ctx = createComarkContext(false)
      const first = tree([['p', {}, 'first']])
      ctx.ensure('x', first)
      ctx.ensure('x', tree([['p', {}, 'second']]))
      expect(ctx.get('x').tree).toBe(first)
    })
  })

  describe('subscribeComarkDocument', () => {
    it('is a no-op without an ambient context', () => {
      expect(subscribeComarkDocument(tree([]), 'x', vi.fn())).toBeNull()
    })

    it('auto-allocates an id when none is provided', () => {
      createComarkContext()
      const onTree = vi.fn()
      const sub = subscribeComarkDocument(tree([['p', {}, 'hi']]), undefined, onTree)
      expect(sub).not.toBeNull()
      expect(sub!.id).toMatch(/^comark-\d+$/)
      expect(globalThis.comarkContext!.keys()).toEqual([sub!.id])
      sub!.cleanup(true)
    })

    it('uses the explicit key when provided', () => {
      createComarkContext()
      const sub = subscribeComarkDocument(tree([['p', {}, 'hi']]), 'page', vi.fn())
      expect(sub!.id).toBe('page')
      expect(globalThis.comarkContext!.keys()).toEqual(['page'])
      sub!.cleanup(true)
    })

    it('set pushes a new tree to listeners', () => {
      createComarkContext()
      const onTree = vi.fn()
      const sub = subscribeComarkDocument(tree([['p', {}, 'a']]), 'page', onTree)
      const next = tree([['p', {}, 'b']])
      sub!.set(next)
      expect(onTree).toHaveBeenCalledWith(next)
      sub!.cleanup(true)
    })
  })

  describe('lifecycle', () => {
    it('emits create on first access and remove on prune', () => {
      const ctx = createComarkContext(false)
      const fn = vi.fn()
      ctx.listen(fn)

      const seed = tree([['p', {}, 'seed']])
      const cleanup = ctx.get('x', seed).listen(vi.fn())
      expect(fn).toHaveBeenCalledWith({ event: 'create', id: 'x', tree: seed })

      ctx.get('x') // existing doc — no second create
      expect(fn).toHaveBeenCalledTimes(1)

      cleanup()
      expect(fn).toHaveBeenLastCalledWith({ event: 'remove', id: 'x', tree: seed })
    })

    it('stops emitting after cleanup', () => {
      const ctx = createComarkContext(false)
      const fn = vi.fn()
      ctx.listen(fn)()
      ctx.get('x')
      expect(fn).not.toHaveBeenCalled()
    })
  })
})
