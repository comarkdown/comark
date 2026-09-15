/**
 * `::form` aggregate — core utilities used by all framework adapters.
 *
 * A `::form{::value="data.formData"}` component:
 * 1. Renders its children normally (each child's `::value` binding writes
 *    directly to the model via the standard two-way binding mechanism).
 * 2. Collects all `::X` model paths from its children AST at render time.
 * 3. On every child write (or on form submit), aggregates the current model
 *    values for those paths and writes them as one object to the form's
 *    own `::value` path.
 *
 * Framework adapters each import `collectFormBindingPaths` and wire the
 * form-submit / model-subscribe loop using their own reactivity primitives.
 */

import type { Node } from '../types.ts'

/**
 * Recursively collect every model path referenced by a `::X` binding in the
 * given node list.  Duplicate paths are de-duplicated.
 */
export function collectFormBindingPaths(nodes: Node[]): string[] {
  const paths: string[] = []
  for (const node of nodes) {
    if (typeof node === 'string' || node[0] === null) continue
    const [, attrs, ...children] = node as [string, Record<string, unknown>, ...Node[]]
    for (const key in attrs) {
      if (key.charCodeAt(0) === 58 && key.charCodeAt(1) === 58) {
        const value = attrs[key]
        if (typeof value === 'string' && value.trim()) {
          paths.push(value.trim())
        }
      }
    }
    if (children.length) paths.push(...collectFormBindingPaths(children as Node[]))
  }
  // De-duplicate while preserving order
  return [...new Set(paths)]
}

/**
 * Build an aggregate object from a list of model paths.
 * Each path's final segment becomes the key; the value comes from the model.
 *
 * e.g. paths = ['data.user.name', 'data.user.email']
 * → { name: model.get('data.user.name'), email: model.get('data.user.email') }
 *
 * When two paths share the same final segment, the last one wins.
 */
export function buildFormAggregate(paths: string[], getValue: (path: string) => unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const path of paths) {
    const key = path.includes('.') ? path.slice(path.lastIndexOf('.') + 1) : path
    result[key] = getValue(path)
  }
  return result
}
