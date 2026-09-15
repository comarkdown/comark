import { describe, expect, it } from 'vitest'
import { collectFormBindingPaths, buildFormAggregate } from '../src/plugins/form'
import type { Node } from '../src/types'

const input = (path: string): Node => ['input', { '::value': path }]
const textarea = (path: string): Node => ['textarea', { '::value': path }]
const nested = (children: Node[]): Node => ['fieldset', {}, ...children]

describe('collectFormBindingPaths', () => {
  it('collects a single ::value path', () => {
    const paths = collectFormBindingPaths([input('data.name')])
    expect(paths).toEqual(['data.name'])
  })

  it('collects multiple sibling paths', () => {
    const paths = collectFormBindingPaths([input('data.name'), input('data.email'), textarea('data.bio')])
    expect(paths).toEqual(['data.name', 'data.email', 'data.bio'])
  })

  it('collects paths from nested children', () => {
    const paths = collectFormBindingPaths([nested([input('data.name'), input('data.email')])])
    expect(paths).toEqual(['data.name', 'data.email'])
  })

  it('de-duplicates repeated paths', () => {
    const paths = collectFormBindingPaths([input('data.name'), input('data.name')])
    expect(paths).toEqual(['data.name'])
  })

  it('ignores text nodes and comment nodes', () => {
    const nodes: Node[] = ['hello', [null, {}, 'comment'], input('data.name')]
    const paths = collectFormBindingPaths(nodes)
    expect(paths).toEqual(['data.name'])
  })

  it('ignores nodes without :: bindings', () => {
    const paths = collectFormBindingPaths([['input', { value: 'literal', type: 'text' }]])
    expect(paths).toEqual([])
  })

  it('collects ::title and ::href in addition to ::value', () => {
    const paths = collectFormBindingPaths([['a', { '::href': 'data.url', '::title': 'data.label' }]])
    expect(paths.sort()).toEqual(['data.label', 'data.url'])
  })
})

describe('buildFormAggregate', () => {
  it('builds an object keyed by the last path segment', () => {
    const agg = buildFormAggregate(
      ['data.name', 'data.email'],
      (p) => ({ 'data.name': 'Alice', 'data.email': 'a@b.com' })[p]
    )
    expect(agg).toEqual({ name: 'Alice', email: 'a@b.com' })
  })

  it('handles paths with no dot separator', () => {
    const agg = buildFormAggregate(['name'], (p) => (p === 'name' ? 'Bob' : undefined))
    expect(agg).toEqual({ name: 'Bob' })
  })

  it('last writer wins for duplicate final segments', () => {
    const agg = buildFormAggregate(['user.name', 'contact.name'], (p) => p)
    expect(agg).toEqual({ name: 'contact.name' })
  })
})
