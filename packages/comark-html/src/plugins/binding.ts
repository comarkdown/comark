import type { NodeHandler } from 'comark/render'

export * from 'comark/plugins/binding'
export { default } from 'comark/plugins/binding'

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * HTML handler for `binding` nodes produced by the `binding` plugin.
 *
 * Renders the resolved value (looked up against the ambient render context via
 * the `:value` dot-path), falling back to `defaultValue` when the path does
 * not resolve, and finally to an empty string. The output is escaped for
 * safe HTML embedding.
 *
 * @example
 * ```ts
 * import binding, { Binding } from '@comark/html/plugins/binding'
 * import { createRender } from '@comark/html'
 *
 * const render = createRender({
 *   plugins: [binding()],
 *   components: { Binding },
 * })
 * ```
 */
export const Binding: NodeHandler = (node, state) => {
  const resolved = state.renderData.props as Record<string, unknown>
  const raw = (node[1] || {}) as Record<string, unknown>
  const out = resolved.value ?? raw.defaultValue
  if (out === undefined || out === null) return ''
  return escape(String(out))
}
