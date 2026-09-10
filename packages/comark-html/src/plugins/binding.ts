import { resolveAttributes, type NodeHandler } from 'comark/render'
import { resolveIfWrapper, shouldRenderIf, type IfProps } from 'comark/plugins/binding'
import { escapeHtml } from 'comark/utils'

export * from 'comark/plugins/binding'
export { default } from 'comark/plugins/binding'

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
 * import { createHtmlRenderer } from '@comark/html'
 *
 * const renderHtml = createHtmlRenderer({
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
  return escapeHtml(String(out))
}

/** Render the children of an `::if` component when its resolved props pass. */
export const If: NodeHandler = async (node, state, parent) => {
  const props = resolveAttributes(state.renderData.props, state.renderData, { parseJson: true }) as IfProps
  if (!shouldRenderIf(props)) return ''

  const wrapper = resolveIfWrapper(props.as)
  state.renderData = { ...state.renderData, props }
  const html = await state.flow(node, state)
  const output = wrapper ? `<${wrapper}>${html}</${wrapper}>` : html
  return output + (parent ? '' : state.context.blockSeparator)
}
