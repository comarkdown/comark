import { afterEach, describe, expect, it, vi } from 'vitest'
import { createComarkContext } from '../src/context'
import type { MarkdownTree } from '../src/types'

function tree(nodes: MarkdownTree['nodes']): MarkdownTree {
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
      const keep: MarkdownTree['nodes'][number] = ['p', {}, 'keep']
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
