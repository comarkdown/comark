import type { ElementNode, MarkdownDocument, Node } from '../../types.ts'
import { resolveAttributes } from '../stringify/attributes.ts'
import {
  compileExpression,
  compileIterable,
  evaluate,
  property,
  spend,
  truthy,
  type Budget,
  type Expression,
} from './expression.ts'

export interface TemplateOptions {
  maxSteps?: number
  maxIterations?: number
  maxOutputLength?: number
}

export function resolveTemplates<
  T extends { nodes: Node[]; meta?: Record<string, any>; frontmatter?: Record<string, any> },
>(document: T, data: Record<string, unknown> = {}, options: TemplateOptions = {}): T {
  if (document.meta?.comarkTemplate !== true) return document
  for (const limit of Object.values(options)) {
    if (!Number.isSafeInteger(limit) || limit <= 0) throw new Error('Template limits must be positive safe integers')
  }
  const budget: Budget = { remaining: options.maxSteps ?? 100000, maxValueLength: options.maxOutputLength ?? 1000000 }
  let iterations = options.maxIterations ?? 10000
  let outputLength = options.maxOutputLength ?? 1000000
  const ancestors = new Set<object>()
  const copyData = (value: unknown, depth = 0): unknown => {
    spend(budget)
    if (depth > 64) throw new Error('Template data nesting limit exceeded')
    if (value == null || typeof value === 'string' || typeof value === 'boolean') return value
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value !== 'object') throw new Error('Template data must contain plain values')
    const prototype = Object.getPrototypeOf(value)
    if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null)
      throw new Error('Template data must contain plain objects')
    if (ancestors.has(value)) throw new Error('Cyclic template data')
    ancestors.add(value)
    const copy = Array.isArray(value) ? new Array(value.length) : Object.create(null)
    for (const key of Object.keys(value)) copy[key] = copyData(property(value, key), depth + 1)
    ancestors.delete(value)
    return copy
  }
  const safeData = copyData(data) as Record<string, unknown>
  const cache = new Map<string, Expression>()
  const run = (source: string, scope: Record<string, unknown>): unknown => {
    let compiled = cache.get(source)
    if (!compiled) {
      compiled = compileExpression(source)
      cache.set(source, compiled)
    }
    return evaluate(compiled, scope, budget)
  }
  const text = (value: unknown): string => {
    if (value !== null && typeof value === 'object')
      throw new Error('Use an explicit method to format template collections')
    const result = value == null ? '' : String(value)
    outputLength -= result.length
    if (outputLength < 0) throw new Error('Template output limit exceeded')
    return result
  }
  const walk = (nodes: Node[], scope: Record<string, unknown>, depth = 0): Node[] => {
    if (depth > 128) throw new Error('Template rendering depth exceeded')
    const result: Node[] = []
    for (const node of nodes) {
      spend(budget)
      if (typeof node === 'string') {
        result.push(text(node))
        continue
      }
      if (node[0] === null) {
        result.push(node)
        continue
      }
      const [tag, attrs, ...children] = node
      if (tag === 'comark-expression') {
        result.push(text(run(String(attrs.source), scope)))
        continue
      }
      if (tag === 'comark-if') {
        for (const [index, branch] of (children as ElementNode[]).entries()) {
          const test = index === 0 ? attrs.test : branch[1].test
          if (test !== undefined && !truthy(run(String(test), scope))) continue
          result.push(...walk(branch.slice(2) as Node[], scope, depth + 1))
          break
        }
        continue
      }
      if (tag === 'comark-for') {
        const { iterable } = compileIterable(String(attrs.expression))
        const collection = evaluate(iterable, scope, budget)
        const values =
          collection == null
            ? []
            : typeof collection === 'string'
              ? [...collection]
              : Array.isArray(collection)
                ? collection
                : typeof collection === 'object'
                  ? Object.keys(collection)
                  : undefined
        if (!values) throw new Error('Template for requires an iterable')
        const names = attrs.names as string[]
        const scopes: Record<string, unknown>[] = []
        for (const value of values) {
          budget.remaining -= Object.keys(scope).length
          spend(budget)
          if (--iterations < 0) throw new Error('Template iteration limit exceeded')
          const locals = Object.assign(Object.create(null), scope) as Record<string, unknown>
          const tuple = names.length === 1 ? [value] : value
          if (!Array.isArray(tuple) || tuple.length !== names.length)
            throw new Error('Template loop unpacking mismatch')
          names.forEach((name, index) => {
            locals[name] = property(tuple, index)
          })
          scopes.push(locals)
        }
        if (!scopes.length && children[1])
          result.push(...walk((children[1] as ElementNode).slice(2) as Node[], scope, depth + 1))
        scopes.forEach((locals, index) => {
          locals.loop = {
            index: index + 1,
            index0: index,
            revindex: scopes.length - index,
            revindex0: scopes.length - index - 1,
            first: index === 0,
            last: index === scopes.length - 1,
            length: scopes.length,
          }
          result.push(...walk((children[0] as ElementNode).slice(2) as Node[], locals, depth + 1))
        })
        continue
      }
      budget.remaining -= Object.keys(attrs).length
      if (Object.keys(attrs).length) budget.remaining -= Object.keys(scope).length
      spend(budget)
      const resolved = resolveAttributes(attrs, scope as unknown as import('../../types.ts').NodeRenderData, {
        parseJson: true,
      })
      const nextScope = Object.keys(resolved).length ? { ...scope, props: resolved } : scope
      result.push([tag, { ...resolved, ...(attrs.$ ? { $: attrs.$ } : {}) }, ...walk(children, nextScope, depth + 1)])
    }
    return result
  }
  const scope = Object.create(null) as Record<string, unknown>
  Object.assign(scope, safeData, {
    data: safeData,
    frontmatter: copyData(document.frontmatter ?? {}),
    meta: copyData(document.meta),
    props: {},
  })
  return { ...document, nodes: walk(document.nodes, scope), meta: { ...document.meta, comarkTemplate: false } } as T &
    MarkdownDocument
}
